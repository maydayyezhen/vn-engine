<script setup lang="ts">
import type { EditorView } from "../stores/editorStore";
import type { ScriptDockTab } from "../stores/layoutStore";

/** 中央下方脚本区属性。 */
defineProps<{
  /** 当前主视图，保留给外部兼容；下方面板不再据此跳转。 */
  activeView: EditorView;
  /** 当前脚本区页签，保留给外部兼容；下方面板固定显示脚本编辑。 */
  activeTab: ScriptDockTab;
}>();

/** 中央下方脚本区事件。 */
defineEmits<{
  /** 更新脚本区页签；当前仅保留接口，不触发非脚本视图跳转。 */
  updateActiveTab: [tab: ScriptDockTab];
}>();
</script>

<template>
  <section class="script-dock">
    <div class="dock-tabs">
      <button class="active" type="button">脚本编辑</button>
      <button type="button" disabled title="入口保留，当前下方面板固定为脚本指令表">分支视图</button>
      <button type="button" disabled title="入口保留，当前下方面板固定为脚本指令表">时间线</button>
      <button type="button" disabled title="动画模块管理已移到右侧属性面板">动画编辑</button>
    </div>
    <div class="dock-content">
      <slot name="script" />
    </div>
  </section>
</template>
