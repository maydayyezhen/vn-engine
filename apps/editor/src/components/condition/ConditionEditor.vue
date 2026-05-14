<script setup lang="ts">
import type { ConditionExpression, ConditionOperator, VNProject } from "@vn-engine/vn-schema";
import { conditionOperatorOptions, coerceConditionValue, createDefaultVariableCondition } from "../../services/conditionEditService";
import { findVariable } from "../../services/variableEditService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前条件表达式。 */
  condition: ConditionExpression | undefined;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新条件表达式。 */
  updateCondition: [condition: ConditionExpression];
}>();

/** 获取当前可编辑变量条件。 */
function editableCondition(): Extract<ConditionExpression, { kind: "variable" }> {
  return props.condition?.kind === "variable"
    ? props.condition
    : (createDefaultVariableCondition(props.project) as Extract<ConditionExpression, { kind: "variable" }>);
}

/** 更新变量名并同步比较值类型。 */
function updateVariableName(variableName: string): void {
  const variable = findVariable(props.project, variableName);
  emit("updateCondition", {
    ...editableCondition(),
    variableName,
    value: variable?.defaultValue ?? ""
  });
}
</script>

<template>
  <div class="condition-editor">
    <el-alert
      v-if="condition && condition.kind !== 'variable'"
      title="当前是组合条件，面板先显示基础结构；本轮提供单条件编辑，组合条件仍会被运行时和校验系统保留。"
      type="info"
      :closable="false"
      show-icon
    />
    <el-form-item label="变量">
      <el-select :model-value="editableCondition().variableName" filterable @update:model-value="updateVariableName">
        <el-option v-for="variable in project.variables ?? []" :key="variable.name" :label="`${variable.name} (${variable.type})`" :value="variable.name" />
      </el-select>
    </el-form-item>
    <el-form-item label="运算符">
      <el-select
        :model-value="editableCondition().operator"
        @update:model-value="(value: ConditionOperator) => $emit('updateCondition', { ...editableCondition(), operator: value })"
      >
        <el-option v-for="operator in conditionOperatorOptions" :key="operator" :label="operator" :value="operator" />
      </el-select>
    </el-form-item>
    <el-form-item label="比较值">
      <template v-if="findVariable(project, editableCondition().variableName)?.type === 'boolean'">
        <el-switch
          :model-value="Boolean(editableCondition().value)"
          @update:model-value="(value: boolean) => $emit('updateCondition', { ...editableCondition(), value })"
        />
      </template>
      <template v-else-if="findVariable(project, editableCondition().variableName)?.type === 'number'">
        <el-input-number
          :model-value="Number(editableCondition().value)"
          @update:model-value="(value: number | undefined) => $emit('updateCondition', { ...editableCondition(), value: value ?? 0 })"
        />
      </template>
      <template v-else>
        <el-input
          :model-value="String(editableCondition().value)"
          @update:model-value="(value: string) => $emit('updateCondition', { ...editableCondition(), value: coerceConditionValue(project, editableCondition().variableName, value) })"
        />
      </template>
    </el-form-item>
  </div>
</template>
