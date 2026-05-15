<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import type { RuntimeSnapshot, VNRuntime } from "@vn-engine/vn-core";
import { PixiVNRenderer } from "@vn-engine/vn-renderer-pixi";
import type { VNProject } from "@vn-engine/vn-schema";
import { choosePreview, nextPreview, restartPreview } from "../services/previewRuntimeService";
import { findAssetById, findCharacterById, findCharacterExpression } from "../services/resourceLookupService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
}>();

/** 当前预览运行时。 */
const runtime = shallowRef<VNRuntime | null>(null);
/** 当前预览快照。 */
const snapshot = ref<RuntimeSnapshot | null>(null);
/** 预览错误信息。 */
const errorMessage = ref("");
/** 当前预览模式。 */
const previewMode = ref<"debug" | "visual">("debug");
/** PixiJS 画面预览挂载容器。 */
const visualContainerRef = ref<HTMLDivElement | null>(null);
/** 编辑器画面预览渲染器。 */
const visualRenderer = shallowRef<PixiVNRenderer | null>(null);

/** 当前背景资源解析结果。 */
const backgroundAsset = computed(() => findAssetById(props.project, snapshot.value?.backgroundAssetId));

/** 当前角色资源解析结果。 */
const displayedCharacters = computed(() =>
  (snapshot.value?.characters ?? []).map((item) => {
    const character = findCharacterById(props.project, item.characterId);
    const expression = findCharacterExpression(props.project, item.characterId, item.expression);
    const asset = findAssetById(props.project, expression?.assetId ?? item.assetId);
    return {
      ...item,
      characterName: character?.displayName || character?.name || item.characterId,
      expressionName: expression?.name || item.expression || "默认",
      assetName: asset?.name || item.assetId || "未绑定素材",
      assetPath: asset?.path || "素材路径缺失"
    };
  })
);

/** 当前物品资源解析结果。 */
const displayedProps = computed(() =>
  (snapshot.value?.props ?? []).map((item) => {
    const asset = findAssetById(props.project, item.assetId);
    return {
      ...item,
      assetName: asset?.name || item.name || item.assetId,
      assetPath: asset?.path || "素材路径缺失"
    };
  })
);

/** 当前音频资源解析结果。 */
const displayedAudio = computed(() =>
  Object.entries(snapshot.value?.audio ?? {})
    .filter(([, assetId]) => Boolean(assetId))
    .map(([channel, assetId]) => {
      const asset = findAssetById(props.project, assetId);
      return {
        channel,
        assetId,
        name: asset?.name || assetId,
        path: asset?.path || "素材路径缺失"
      };
    })
);

/** 确保画面预览渲染器已挂载。 */
async function ensureVisualRenderer(): Promise<PixiVNRenderer | null> {
  if (!visualContainerRef.value) return null;
  if (!visualRenderer.value) {
    const renderer = new PixiVNRenderer({
      width: 640,
      height: 360,
      onActionSequenceComplete: handleVisualActionSequenceComplete,
      onAnimationComplete: handleVisualAnimationComplete
    });
    await renderer.mount(visualContainerRef.value);
    visualRenderer.value = renderer;
  }
  return visualRenderer.value;
}

/** 渲染编辑器画面预览，不播放真实音频。 */
async function renderVisualPreview(): Promise<void> {
  if (previewMode.value !== "visual" || !snapshot.value) return;
  await nextTick();
  const renderer = await ensureVisualRenderer();
  await renderer?.render(snapshot.value, props.project, { hideRuntimeUi: false });
}

/** 重新开始预览。 */
function restart(): void {
  try {
    const result = restartPreview(props.project);
    runtime.value = result.runtime;
    snapshot.value = result.snapshot;
    errorMessage.value = "";
    void renderVisualPreview();
  } catch (error) {
    runtime.value = null;
    snapshot.value = null;
    errorMessage.value = error instanceof Error ? error.message : "预览启动失败。";
  }
}

/** 推进预览。 */
function next(): void {
  if (!runtime.value || !snapshot.value || snapshot.value.isWaitingForActionCompletion || snapshot.value.type === "choices" || snapshot.value.isEnded) return;
  snapshot.value = nextPreview(runtime.value);
  void renderVisualPreview();
}

/** 画面预览动作序列完成后继续推进。 */
function handleVisualActionSequenceComplete(): void {
  if (!runtime.value || !snapshot.value?.isWaitingForActionCompletion) return;
  snapshot.value = runtime.value.completeActionSequence();
  void renderVisualPreview();
}

/** 画面预览代码型动画完成后继续推进。 */
function handleVisualAnimationComplete(): void {
  if (!runtime.value || !snapshot.value?.isWaitingForActionCompletion) return;
  snapshot.value = runtime.value.completeAnimation();
  void renderVisualPreview();
}

/** 选择预览选项。 */
function choose(optionId: string): void {
  if (!runtime.value) return;
  snapshot.value = choosePreview(runtime.value, optionId);
  void renderVisualPreview();
}

watch(previewMode, () => {
  void renderVisualPreview();
});

watch(
  () => props.project,
  () => {
    errorMessage.value = "";
    void renderVisualPreview();
  }
);

restart();

onBeforeUnmount(() => {
  visualRenderer.value?.destroy();
  visualRenderer.value = null;
});

defineExpose({
  /** 暴露给顶部工具栏使用的重新开始预览动作。 */
  restart
});
</script>

<template>
  <el-card class="preview-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>运行预览</span>
        <div class="preview-actions">
          <el-segmented
            v-model="previewMode"
            size="small"
            :options="[
              { label: '调试预览', value: 'debug' },
              { label: '画面预览', value: 'visual' }
            ]"
          />
          <el-button size="small" type="primary" @click="restart">重新开始预览</el-button>
        </div>
      </div>
    </template>

    <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" show-icon />

    <div v-else-if="snapshot && previewMode === 'visual'" class="visual-preview-panel">
      <div ref="visualContainerRef" class="editor-visual-stage"></div>
      <div class="visual-preview-controls">
        <el-button size="small" :disabled="snapshot.isWaitingForActionCompletion || snapshot.type === 'choices' || snapshot.isEnded" @click="next">
          {{ snapshot.isWaitingForActionCompletion ? "演出中" : "下一步" }}
        </el-button>
        <template v-if="snapshot.type === 'choices'">
          <el-button v-for="choice in snapshot.choices" :key="choice.id" size="small" @click="choose(choice.id)">
            {{ choice.text }}
          </el-button>
        </template>
      </div>
    </div>

    <div v-else-if="snapshot" class="preview-grid">
      <div class="preview-stage">
        <div class="preview-meta">
          背景：{{ backgroundAsset ? `${backgroundAsset.name} / ${backgroundAsset.path}` : snapshot.backgroundAssetId || "无" }}
        </div>
        <div class="preview-meta">
          角色：
          <span v-if="displayedCharacters.length">
            <span v-for="character in displayedCharacters" :key="character.characterId" class="inline-item">
              {{ character.characterName }} / {{ character.expressionName }} / {{ character.assetPath }}
            </span>
          </span>
          <span v-else>无</span>
        </div>
        <div class="preview-meta">
          镜头：zoom {{ snapshot.camera.zoom }} / offset {{ snapshot.camera.offsetX }}, {{ snapshot.camera.offsetY }} / shake {{ snapshot.camera.shake ? "on" : "off" }}
        </div>
        <div class="preview-meta">
          物品：
          <span v-if="displayedProps.length">
            <span v-for="prop in displayedProps" :key="prop.propId" class="inline-item">
              {{ prop.propId }} / {{ prop.assetName }} / {{ prop.assetPath }}
            </span>
          </span>
          <span v-else>无</span>
        </div>
        <div class="preview-meta">
          音频：
          <span v-if="displayedAudio.length">
            <span v-for="audio in displayedAudio" :key="audio.channel" class="inline-item">{{ audio.channel }}: {{ audio.name }} / {{ audio.path }}</span>
          </span>
          <span v-else>无</span>
        </div>
        <div class="preview-dialogue">
          <strong>{{ snapshot.isEnded ? "预览已结束" : snapshot.speaker || "旁白" }}</strong>
          <p>{{ snapshot.isEnded ? "预览已结束" : snapshot.text }}</p>
        </div>
        <div v-if="snapshot.type === 'choices'" class="preview-choices">
          <el-button v-for="choice in snapshot.choices" :key="choice.id" size="small" @click="choose(choice.id)">
            {{ choice.text }}
          </el-button>
        </div>
        <div class="preview-meta">
          pendingActions：{{ snapshot.pendingActions.length }}
        </div>
        <div class="preview-meta">
          pendingAnimations：{{ snapshot.pendingAnimations.length }}
        </div>
        <el-button size="small" :disabled="snapshot.isWaitingForActionCompletion || snapshot.type === 'choices' || snapshot.isEnded" @click="next">
          {{ snapshot.isWaitingForActionCompletion ? "演出中" : "下一步" }}
        </el-button>
      </div>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="脚本">{{ snapshot.currentScriptId }}</el-descriptions-item>
        <el-descriptions-item label="节点">{{ snapshot.currentNodeId || "结束" }}</el-descriptions-item>
        <el-descriptions-item label="变量">
          <pre>{{ JSON.stringify(snapshot.variables, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="逻辑日志">
          <div class="debug-log-list">
            <div v-for="event in snapshot.debugLog.slice(-8)" :key="event.id" class="debug-log-item">
              [{{ event.type }}] {{ event.message }}
            </div>
            <span v-if="!snapshot.debugLog.length">暂无日志</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>
