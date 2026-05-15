<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const topMinHeight = 220;
const bottomMinHeight = 180;
const handleHeight = 6;
const topHeightRatio = 0.62;

const stageRef = ref<HTMLElement | null>(null);
const topPanelHeight = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);

function clampHeight(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return Math.round(value);
}

function getAvailableHeight(): number {
  const total = stageRef.value?.clientHeight ?? 0;
  return Math.max(0, total - 28 - handleHeight);
}

function recalcPanelHeight(): void {
  const available = getAvailableHeight();
  if (!available) return;

  const maxTop = Math.max(topMinHeight, available - bottomMinHeight);
  if (!topPanelHeight.value) {
    topPanelHeight.value = clampHeight(Math.round(available * topHeightRatio), topMinHeight, maxTop);
    return;
  }

  topPanelHeight.value = clampHeight(topPanelHeight.value, topMinHeight, maxTop);
}

function resetLayout(): void {
  const available = getAvailableHeight();
  if (!available) return;
  const maxTop = Math.max(topMinHeight, available - bottomMinHeight);
  topPanelHeight.value = clampHeight(Math.round(available * topHeightRatio), topMinHeight, maxTop);
}

function handleExternalResetLayout(): void {
  resetLayout();
}

function onPointerMove(event: MouseEvent): void {
  if (!isDragging.value || !stageRef.value) return;

  const available = getAvailableHeight();
  if (!available) return;

  const maxTop = Math.max(topMinHeight, available - bottomMinHeight);
  const nextHeight = startHeight.value + (event.clientY - startY.value);
  topPanelHeight.value = clampHeight(nextHeight, topMinHeight, maxTop);
}

function stopDrag(): void {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.body.style.userSelect = "";
  window.removeEventListener("mousemove", onPointerMove);
  window.removeEventListener("mouseup", stopDrag);
}

function startDrag(event: MouseEvent): void {
  isDragging.value = true;
  startY.value = event.clientY;
  startHeight.value = topPanelHeight.value;
  document.body.style.userSelect = "none";
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", stopDrag);
}

onMounted(() => {
  recalcPanelHeight();
  window.addEventListener("resize", recalcPanelHeight);
  window.addEventListener("vn-editor-reset-layout", handleExternalResetLayout);
});

onBeforeUnmount(() => {
  stopDrag();
  window.removeEventListener("resize", recalcPanelHeight);
  window.removeEventListener("vn-editor-reset-layout", handleExternalResetLayout);
  window.removeEventListener("mousemove", onPointerMove);
  window.removeEventListener("mouseup", stopDrag);
});

defineExpose({
  resetLayout
});
</script>

<template>
  <section
    ref="stageRef"
    class="center-stage"
    :style="{ '--center-top-height': `${topPanelHeight}px` }"
  >
    <slot name="tabs" />
    <section class="center-stage-visual"><slot name="visual" /></section>
    <div class="center-stage-resize-handle" @mousedown="startDrag" />
    <section class="center-stage-dock"><slot name="dock" /></section>
  </section>
</template>
