<script setup lang="ts">
import type { AnimationModule } from "@vn-engine/vn-renderer-pixi";

/** 组件属性。 */
const props = defineProps<{
  /** 动画模块。 */
  animation: AnimationModule | undefined;
  /** 当前参数。 */
  params: Record<string, unknown>;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新参数。 */
  updateParams: [params: Record<string, unknown>];
}>();

/** 更新单个参数。 */
function updateParam(key: string, value: unknown): void {
  emit("updateParams", { ...props.params, [key]: value });
}
</script>

<template>
  <div class="animation-param-form">
    <el-alert v-if="!animation" title="请先选择动画模块" type="info" :closable="false" />
    <template v-else>
      <el-form-item v-for="(schema, key) in animation.paramsSchema" :key="key" :label="schema.label">
        <el-input-number
          v-if="schema.type === 'number'"
          :model-value="Number(params[key] ?? schema.default ?? 0)"
          :min="schema.min"
          :max="schema.max"
          :step="schema.step ?? 1"
          @update:model-value="(value: number | undefined) => updateParam(String(key), value ?? schema.default ?? 0)"
        />
        <el-switch
          v-else-if="schema.type === 'boolean'"
          :model-value="Boolean(params[key] ?? schema.default ?? false)"
          @update:model-value="(value: boolean) => updateParam(String(key), value)"
        />
        <el-select
          v-else-if="schema.type === 'select'"
          :model-value="params[key] ?? schema.default"
          @update:model-value="(value: string | number | boolean) => updateParam(String(key), value)"
        >
          <el-option v-for="option in schema.options ?? []" :key="String(option.value)" :label="option.label" :value="option.value" />
        </el-select>
        <el-color-picker
          v-else-if="schema.type === 'color'"
          :model-value="String(params[key] ?? schema.default ?? '#ffffff')"
          @update:model-value="(value: string | null) => updateParam(String(key), value ?? schema.default ?? '#ffffff')"
        />
        <el-input
          v-else
          :model-value="String(params[key] ?? schema.default ?? '')"
          @update:model-value="(value: string) => updateParam(String(key), value)"
        />
        <el-text v-if="schema.description" size="small" type="info">{{ schema.description }}</el-text>
      </el-form-item>
    </template>
  </div>
</template>
