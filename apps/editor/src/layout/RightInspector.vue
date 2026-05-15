<script setup lang="ts">
/** 右侧检查器属性。 */
defineProps<{
  /** 当前对象描述。 */
  selectionLabel: string;
}>();
</script>

<template>
  <section class="right-inspector-panel">
    <div class="inspector-title">属性面板</div>
    <div class="inspector-selection">{{ selectionLabel }}</div>
    <div class="inspector-content">
      <slot name="properties" />
    </div>
  </section>
</template>
