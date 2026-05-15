<script setup lang="ts">
import type { VNProject, VNVariableDefinition, VNVariableType } from "@vn-engine/vn-schema";
import { createDefaultVariableValue, updateVariable } from "../services/variableEditService";

/** 单个变量属性面板属性。 */
const props = defineProps<{
  /** 当前工程。 */
  project: VNProject;
  /** 当前选中的变量。 */
  variable?: VNVariableDefinition;
}>();

/** 单个变量属性面板事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
}>();

/** 可选变量类型。 */
const variableTypes: VNVariableType[] = ["boolean", "number", "string"];

/** 更新当前变量。 */
function handleUpdateVariable(patch: Partial<VNVariableDefinition>): void {
  if (!props.variable) return;
  emit("projectChange", updateVariable(props.project, props.variable.name, patch));
}
</script>

<template>
  <section class="resource-inspector-panel">
    <el-form v-if="variable" label-position="top" class="resource-inspector-form">
      <el-form-item label="变量名">
        <el-input :model-value="variable.name" size="small" @change="(value: string) => handleUpdateVariable({ name: value })" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select
          :model-value="variable.type"
          size="small"
          @update:model-value="(value: VNVariableType) => handleUpdateVariable({ type: value, defaultValue: createDefaultVariableValue(value) })"
        >
          <el-option v-for="type in variableTypes" :key="type" :label="type" :value="type" />
        </el-select>
      </el-form-item>
      <el-form-item label="默认值">
        <el-switch v-if="variable.type === 'boolean'" :model-value="Boolean(variable.defaultValue)" @update:model-value="(value: boolean) => handleUpdateVariable({ defaultValue: value })" />
        <el-input-number v-else-if="variable.type === 'number'" :model-value="Number(variable.defaultValue)" @update:model-value="(value: number | undefined) => handleUpdateVariable({ defaultValue: value ?? 0 })" />
        <el-input v-else :model-value="String(variable.defaultValue)" size="small" @update:model-value="(value: string) => handleUpdateVariable({ defaultValue: value })" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input :model-value="variable.description" type="textarea" :rows="3" @update:model-value="(value: string) => handleUpdateVariable({ description: value })" />
      </el-form-item>
    </el-form>
    <div v-else class="inspector-empty-state">
      <strong>未选择变量</strong>
      <span>在左侧资源管理器中点击具体变量后编辑。</span>
    </div>
  </section>
</template>
