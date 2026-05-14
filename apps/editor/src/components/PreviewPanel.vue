<script setup lang="ts">
import { ref, shallowRef, watch } from "vue";
import type { RuntimeSnapshot, VNRuntime } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { choosePreview, nextPreview, restartPreview } from "../services/previewRuntimeService";

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

/** 重新开始预览。 */
function restart(): void {
  try {
    const result = restartPreview(props.project);
    runtime.value = result.runtime;
    snapshot.value = result.snapshot;
    errorMessage.value = "";
  } catch (error) {
    runtime.value = null;
    snapshot.value = null;
    errorMessage.value = error instanceof Error ? error.message : "预览启动失败。";
  }
}

/** 推进预览。 */
function next(): void {
  if (!runtime.value || !snapshot.value || snapshot.value.type === "choices" || snapshot.value.isEnded) return;
  snapshot.value = nextPreview(runtime.value);
}

/** 选择预览选项。 */
function choose(optionId: string): void {
  if (!runtime.value) return;
  snapshot.value = choosePreview(runtime.value, optionId);
}

watch(
  () => props.project,
  () => {
    errorMessage.value = "";
  }
);

restart();

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
        <el-button size="small" type="primary" @click="restart">重新开始预览</el-button>
      </div>
    </template>

    <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" show-icon />
    <div v-else-if="snapshot" class="preview-grid">
      <div class="preview-stage">
        <div class="preview-meta">背景：{{ snapshot.backgroundAssetId || "无" }}</div>
        <div class="preview-meta">角色：{{ snapshot.characters.length ? snapshot.characters.map((item) => item.characterId).join(", ") : "无" }}</div>
        <div class="preview-dialogue">
          <strong>{{ snapshot.isEnded ? "预览已结束" : snapshot.speaker || "旁白" }}</strong>
          <p>{{ snapshot.isEnded ? "预览已结束" : snapshot.text }}</p>
        </div>
        <div v-if="snapshot.type === 'choices'" class="preview-choices">
          <el-button v-for="choice in snapshot.choices" :key="choice.id" size="small" @click="choose(choice.id)">
            {{ choice.text }}
          </el-button>
        </div>
        <el-button size="small" :disabled="snapshot.type === 'choices' || snapshot.isEnded" @click="next">下一步</el-button>
      </div>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="脚本">{{ snapshot.currentScriptId }}</el-descriptions-item>
        <el-descriptions-item label="节点">{{ snapshot.currentNodeId || "结束" }}</el-descriptions-item>
        <el-descriptions-item label="变量">
          <pre>{{ JSON.stringify(snapshot.variables, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>
