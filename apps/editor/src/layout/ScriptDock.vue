<script setup lang="ts">
import type { EditorView } from "../stores/editorStore";
import type { ScriptDockTab } from "../stores/layoutStore";

/** 中央下方工作区属性。 */
defineProps<{
  /** 当前主视图。 */
  activeView: EditorView;
  /** 当前剧本工作区页签。 */
  activeTab: ScriptDockTab;
}>();

/** 中央下方工作区事件。 */
defineEmits<{
  /** 更新剧本工作区页签。 */
  updateActiveTab: [tab: ScriptDockTab];
}>();
</script>

<template>
  <section class="script-dock">
    <template v-if="activeView === 'script'">
      <div class="dock-tabs">
        <button :class="{ active: activeTab === 'script' }" @click="$emit('updateActiveTab', 'script')">脚本编辑</button>
        <button :class="{ active: activeTab === 'branch' }" @click="$emit('updateActiveTab', 'branch')">分支视图</button>
        <button :class="{ active: activeTab === 'timeline' }" @click="$emit('updateActiveTab', 'timeline')">时间线</button>
        <button :class="{ active: activeTab === 'animation' }" @click="$emit('updateActiveTab', 'animation')">动画编辑</button>
      </div>
      <div class="dock-content">
        <slot v-if="activeTab === 'script'" name="script" />
        <slot v-else-if="activeTab === 'animation'" name="animation" />
        <div v-else class="dock-placeholder">
          <strong>{{ activeTab === "branch" ? "分支视图" : "时间线" }}</strong>
          <span>入口已保留。本轮不新增节点图或复杂关键帧时间线。</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="dock-workspace-header">
        <strong>
          {{ activeView === "assets" ? "素材库" : activeView === "characters" ? "角色管理" : activeView === "variables" ? "变量管理" : "导出 / 构建" }}
        </strong>
      </div>
      <div class="dock-content">
        <slot name="workspace" />
      </div>
    </template>
  </section>
</template>
