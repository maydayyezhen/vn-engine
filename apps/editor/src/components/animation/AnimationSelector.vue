<script setup lang="ts">
import { computed } from "vue";
import { createDefaultAnimationRegistry } from "@vn-engine/vn-renderer-pixi";

/** 组件属性。 */
const props = defineProps<{
  /** 当前动画 id。 */
  modelValue: string;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新动画 id。 */
  "update:modelValue": [value: string];
}>();

/** 动画模块列表。 */
const animations = createDefaultAnimationRegistry().list();
/** 当前动画模块。 */
const selectedAnimation = computed(() => animations.find((animation) => animation.id === props.modelValue));
</script>

<template>
  <div class="animation-selector">
    <el-select :model-value="modelValue" filterable @update:model-value="(value: string) => emit('update:modelValue', value)">
      <el-option
        v-for="animation in animations"
        :key="animation.id"
        :label="`${animation.name} (${animation.id})`"
        :value="animation.id"
      >
        <span>{{ animation.name }}</span>
        <span class="animation-option-id">{{ animation.id }}</span>
      </el-option>
    </el-select>
    <el-text v-if="selectedAnimation?.description" size="small" type="info">
      {{ selectedAnimation.description }}
    </el-text>
  </div>
</template>

<style scoped>
.animation-selector {
  display: grid;
  gap: 6px;
}

.animation-option-id {
  float: right;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
