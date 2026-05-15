<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const explorerMinWidth = 220;
const inspectorMinWidth = 260;
const centerMinWidth = 420;
const dividerWidth = 6;
const defaultExplorerWidth = 300;
const defaultInspectorWidth = 420;

const explorerWidth = ref(defaultExplorerWidth);
const inspectorWidth = ref(defaultInspectorWidth);
const bodyRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const draggingSide = ref<"left" | "right" | null>(null);
const startX = ref(0);
const startExplorerWidth = ref(defaultExplorerWidth);
const startInspectorWidth = ref(defaultInspectorWidth);

function clampWidth(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return Math.round(value);
}

function getBodyWidth(): number {
  return bodyRef.value?.getBoundingClientRect().width ?? 0;
}

function recalcClampWidths(): void {
  const total = getBodyWidth();
  if (!total) return;

  const maxExplorer = Math.max(
    explorerMinWidth,
    total - inspectorWidth.value - dividerWidth * 2 - centerMinWidth
  );
  const maxInspector = Math.max(
    inspectorMinWidth,
    total - explorerWidth.value - dividerWidth * 2 - centerMinWidth
  );

  explorerWidth.value = clampWidth(explorerWidth.value, explorerMinWidth, maxExplorer);
  inspectorWidth.value = clampWidth(inspectorWidth.value, inspectorMinWidth, maxInspector);
}

function onPointerMove(event: MouseEvent): void {
  if (!isDragging.value || !draggingSide.value || !bodyRef.value) return;

  const totalWidth = getBodyWidth();
  const delta = event.clientX - startX.value;
  const maxExplorer = Math.max(
    explorerMinWidth,
    totalWidth - inspectorWidth.value - dividerWidth * 2 - centerMinWidth
  );
  const maxInspector = Math.max(
    inspectorMinWidth,
    totalWidth - explorerWidth.value - dividerWidth * 2 - centerMinWidth
  );

  if (draggingSide.value === "left") {
    explorerWidth.value = clampWidth(startExplorerWidth.value + delta, explorerMinWidth, maxExplorer);
    return;
  }

  inspectorWidth.value = clampWidth(startInspectorWidth.value - delta, inspectorMinWidth, maxInspector);
}

function stopDrag(): void {
  if (!isDragging.value) return;
  isDragging.value = false;
  draggingSide.value = null;
  document.body.style.userSelect = "";
  window.removeEventListener("mousemove", onPointerMove);
  window.removeEventListener("mouseup", stopDrag);
}

function startDrag(side: "left" | "right", event: MouseEvent): void {
  if (!bodyRef.value) return;

  isDragging.value = true;
  draggingSide.value = side;
  startX.value = event.clientX;
  startExplorerWidth.value = explorerWidth.value;
  startInspectorWidth.value = inspectorWidth.value;
  document.body.style.userSelect = "none";

  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", stopDrag);
}

function onWindowResize(): void {
  recalcClampWidths();
}

function resetLayout(): void {
  explorerWidth.value = defaultExplorerWidth;
  inspectorWidth.value = defaultInspectorWidth;
  recalcClampWidths();
}

function handleExternalResetLayout(): void {
  resetLayout();
}

defineExpose({
  resetLayout
});

onMounted(() => {
  recalcClampWidths();
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("vn-editor-reset-layout", handleExternalResetLayout);
});

onBeforeUnmount(() => {
  stopDrag();
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("vn-editor-reset-layout", handleExternalResetLayout);
  window.removeEventListener("mousemove", onPointerMove);
  window.removeEventListener("mouseup", stopDrag);
});
</script>

<template>
  <div class="editor-workbench">
    <header class="workbench-menu">
      <slot name="menu" />
    </header>
    <section
      ref="bodyRef"
      class="workbench-body"
      :style="{
        '--workbench-explorer-width': `${explorerWidth}px`,
        '--workbench-inspector-width': `${inspectorWidth}px`,
        '--workbench-divider-width': `${dividerWidth}px`
      }"
    >
      <aside class="workbench-explorer">
        <slot name="explorer" />
      </aside>
      <div class="workbench-resize-handle workbench-resize-handle--left" @mousedown="startDrag('left', $event)" />
      <main class="workbench-center">
        <slot name="center" />
      </main>
      <div class="workbench-resize-handle workbench-resize-handle--right" @mousedown="startDrag('right', $event)" />
      <aside class="workbench-inspector">
        <slot name="inspector" />
      </aside>
    </section>
    <footer class="workbench-statusbar">
      <slot name="statusbar" />
    </footer>
  </div>
</template>
