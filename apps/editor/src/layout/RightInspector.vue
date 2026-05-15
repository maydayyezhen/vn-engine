<script setup lang="ts">
import type { InspectorTab } from "../stores/layoutStore";

/** 右侧检查器属性。 */
defineProps<{
  /** 当前对象描述。 */
  selectionLabel: string;
  /** 当前激活的检查器页签。 */
  activeTab: InspectorTab;
  /** 是否显示角色管理页签。 */
  showCharacterTab: boolean;
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
      <button v-if="showCharacterTab" :class="{ active: activeTab === 'characters' }" @click="$emit('updateActiveTab', 'characters')">角色管理</button>
    </div>
    <div class="inspector-selection">{{ selectionLabel }}</div>
    <div class="inspector-content">
      <slot v-if="activeTab === 'characters'" name="characters" />
      <slot v-else name="properties" />
    </div>
  </section>
</template>
