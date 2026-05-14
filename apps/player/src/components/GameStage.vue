<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { createChoiceBridge } from "../renderer/playerRenderBridge";
import { usePixiVNRenderer } from "../renderer/usePixiVNRenderer";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
  /** 是否隐藏运行时对话和选项 UI。 */
  uiHidden?: boolean;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 玩家选择某个选项。 */
  choose: [optionId: string];
  /** 动作序列播放完成。 */
  actionSequenceComplete: [];
}>();

/** PixiJS 挂载容器。 */
const containerRef = ref<HTMLElement | null>(null);
/** 渲染器是否已经挂载。 */
const mounted = ref(false);
/** 容器尺寸观察器。 */
let resizeObserver: ResizeObserver | null = null;

const pixi = usePixiVNRenderer(
  createChoiceBridge((optionId) => emit("choose", optionId)),
  () => emit("actionSequenceComplete")
);

const backgroundLabel = computed(() => props.snapshot.backgroundAssetId ?? props.snapshot.background?.assetId ?? "未设置背景");

const speakerLabel = computed(() => {
  if (props.snapshot.isEnded) return "结束";
  if (!props.snapshot.speaker) return "旁白";
  const character = props.project.characters.find((item) => item.id === props.snapshot.speaker);
  return character?.displayName || character?.name || props.snapshot.speaker;
});

const shouldShowDialogueFallback = computed(() => Boolean(props.snapshot.text || props.snapshot.isEnded));

function getCharacterName(characterId: string): string {
  const character = props.project.characters.find((item) => item.id === characterId);
  return character?.displayName || character?.name || characterId;
}

/** 渲染当前快照。 */
async function renderCurrent(): Promise<void> {
  if (!mounted.value) return;
  await pixi.render(props.snapshot, props.project, { hideRuntimeUi: props.uiHidden });
}

/** 按 16:9 约束计算舞台尺寸。 */
function resizeRenderer(element: HTMLElement): void {
  const width = element.clientWidth || 1280;
  const expectedHeight = width * 9 / 16;
  const availableHeight = element.clientHeight || expectedHeight;
  const height = Math.max(180, Math.min(availableHeight, expectedHeight));
  pixi.resize(width, height);
  void renderCurrent();
}

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;
  await pixi.mount(containerRef.value);
  mounted.value = true;
  resizeRenderer(containerRef.value);
  await renderCurrent();

  resizeObserver = new ResizeObserver(() => {
    if (containerRef.value) resizeRenderer(containerRef.value);
  });
  resizeObserver.observe(containerRef.value);
});

watch(
  () => [props.snapshot, props.project, props.uiHidden] as const,
  () => {
    void renderCurrent();
  }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  pixi.destroy();
});
</script>

<template>
  <section class="game-stage" aria-label="视觉小说舞台">
    <div ref="containerRef" class="pixi-stage-container" />
    <div class="dom-stage-overlay" aria-hidden="true">
      <div class="dom-background-label">背景：{{ backgroundLabel }}</div>
      <div class="dom-character-row">
        <div v-for="character in snapshot.characters" :key="character.characterId" class="dom-character-card">
          <strong>{{ getCharacterName(character.characterId) }}</strong>
          <span>{{ character.expression || "默认" }}</span>
        </div>
      </div>
      <div v-if="shouldShowDialogueFallback" class="dom-dialogue-box">
        <strong>{{ speakerLabel }}</strong>
        <p>{{ snapshot.isEnded ? "剧情已结束" : snapshot.text }}</p>
      </div>
    </div>
  </section>
</template>
