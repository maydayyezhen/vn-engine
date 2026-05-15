<script setup lang="ts">
import type { InspectorTab } from "../stores/layoutStore";

/** 右侧检查器属性。 */
defineProps<{
  /** 当前对象描述。 */
  selectionLabel: string;
  /** 当前激活的检查器页签。 */
  activeTab: InspectorTab;
  /** 是否显示资源管理页签。 */
  showAssetTab: boolean;
  /** 是否显示角色管理页签。 */
  showCharacterTab: boolean;
  /** 是否显示变量管理页签。 */
  showVariableTab: boolean;
  /** 是否显示导出构建页签。 */
  showExportTab: boolean;
  /** 是否显示动画管理页签。 */
  showAnimationTab: boolean;
}>();

/** 右侧检查器事件。 */
defineEmits<{
  /** 更新当前检查器页签。 */
  updateActiveTab: [tab: InspectorTab];
}>();
</script>

<template>
  <section class="right-inspector-panel">
    <div class="inspector-tabs">
      <button :class="{ active: activeTab === 'properties' }" @click="$emit('updateActiveTab', 'properties')">属性面板</button>
      <button v-if="showAssetTab" :class="{ active: activeTab === 'assets' }" @click="$emit('updateActiveTab', 'assets')">资源管理</button>
      <button v-if="showCharacterTab" :class="{ active: activeTab === 'characters' }" @click="$emit('updateActiveTab', 'characters')">角色管理</button>
      <button v-if="showVariableTab" :class="{ active: activeTab === 'variables' }" @click="$emit('updateActiveTab', 'variables')">变量管理</button>
      <button v-if="showExportTab" :class="{ active: activeTab === 'export' }" @click="$emit('updateActiveTab', 'export')">导出构建</button>
      <button v-if="showAnimationTab" :class="{ active: activeTab === 'animations' }" @click="$emit('updateActiveTab', 'animations')">动画管理</button>
    </div>
    <div class="inspector-selection">{{ selectionLabel }}</div>
    <div class="inspector-content">
      <slot v-if="activeTab === 'assets'" name="assets" />
      <slot v-else-if="activeTab === 'characters'" name="characters" />
      <slot v-else-if="activeTab === 'variables'" name="variables" />
      <slot v-else-if="activeTab === 'export'" name="export" />
      <slot v-else-if="activeTab === 'animations'" name="animations" />
      <slot v-else name="properties" />
    </div>
  </section>
</template>
