<script setup lang="ts">
import type { InspectorTab } from "../stores/layoutStore";

/** 右侧检查器属性。 */
defineProps<{
  /** 当前检查器页签。 */
  activeTab: InspectorTab;
  /** 当前对象描述。 */
  selectionLabel: string;
}>();

/** 右侧检查器事件。 */
defineEmits<{
  /** 更新检查器页签。 */
  updateActiveTab: [tab: InspectorTab];
}>();
</script>

<template>
  <section class="right-inspector-panel">
    <div class="inspector-tabs">
      <button :class="{ active: activeTab === 'properties' }" @click="$emit('updateActiveTab', 'properties')">属性面板</button>
      <button :class="{ active: activeTab === 'events' }" @click="$emit('updateActiveTab', 'events')">事件检查器</button>
    </div>
    <div class="inspector-selection">{{ selectionLabel }}</div>
    <div class="inspector-content">
      <slot v-if="activeTab === 'properties'" name="properties" />
      <slot v-else name="events" />
    </div>
  </section>
</template>
