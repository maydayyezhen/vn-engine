<script setup lang="ts">
import type { StageTab } from "../stores/layoutStore";

/** 画面预览面板属性。 */
defineProps<{
  /** 当前场景区页签。 */
  stageTab: StageTab;
  /** 当前缩放比例。 */
  zoom: number;
}>();

/** 画面预览面板事件。 */
defineEmits<{
  /** 更新缩放比例。 */
  updateZoom: [value: number];
}>();
</script>

<template>
  <section class="visual-stage-panel">
    <div class="stage-header">
      <div>
        <strong>场景预览</strong>
        <span>当前项目画面，不播放编辑器真实音频</span>
      </div>
      <div class="stage-zoom-controls">
        <button @click="$emit('updateZoom', zoom - 0.1)">-</button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button @click="$emit('updateZoom', zoom + 0.1)">+</button>
      </div>
    </div>
    <div v-if="stageTab === 'preview'" class="visual-stage-content" :style="{ '--preview-zoom': String(zoom) }">
      <slot />
    </div>
    <div v-else class="stage-placeholder">
      <strong>{{ stageTab === "flow" ? "流程图" : stageTab === "portrait" ? "立绘编辑" : "UI编辑" }}</strong>
      <span>入口已保留。本轮只重构工作台，不新增该功能。</span>
    </div>
  </section>
</template>
