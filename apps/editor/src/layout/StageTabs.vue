<script setup lang="ts">
import type { StageTab } from "../stores/layoutStore";

/** 场景区页签属性。 */
defineProps<{
  /** 当前页签。 */
  modelValue: StageTab;
}>();

/** 场景区页签事件。 */
defineEmits<{
  /** 更新当前页签。 */
  "update:modelValue": [value: StageTab];
}>();
</script>

<template>
  <div class="stage-tabs">
    <button :class="{ active: modelValue === 'preview' }" @click="$emit('update:modelValue', 'preview')">场景预览</button>
    <button :class="{ active: modelValue === 'flow' }" @click="$emit('update:modelValue', 'flow')">流程图</button>
    <button :class="{ active: modelValue === 'portrait' }" @click="$emit('update:modelValue', 'portrait')">立绘编辑</button>
    <button :class="{ active: modelValue === 'ui' }" @click="$emit('update:modelValue', 'ui')">UI编辑</button>
  </div>
</template>
