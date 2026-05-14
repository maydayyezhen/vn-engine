<script setup lang="ts">
import type { VNProject, VNVariableDefinition, VNVariableType } from "@vn-engine/vn-schema";
import { addVariable, createDefaultVariableValue, deleteVariable, updateVariable } from "../services/variableEditService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
}>();

/** 支持的变量类型。 */
const variableTypes: VNVariableType[] = ["boolean", "number", "string"];

/** 新增变量。 */
function handleAddVariable(): void {
  emit("projectChange", addVariable(props.project));
}

/** 更新变量。 */
function handleUpdateVariable(variable: VNVariableDefinition, patch: Partial<VNVariableDefinition>): void {
  emit("projectChange", updateVariable(props.project, variable.name, patch));
}

/** 删除变量。 */
function handleDeleteVariable(variableName: string): void {
  emit("projectChange", deleteVariable(props.project, variableName));
}

/** 根据类型更新默认值。 */
function handleDefaultValueChange(variable: VNVariableDefinition, value: string | number | boolean): void {
  handleUpdateVariable(variable, { defaultValue: value });
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>变量管理</span>
        <el-button size="small" type="primary" @click="handleAddVariable">新增变量</el-button>
      </div>
    </template>

    <el-alert
      title="变量定义只描述默认值和类型；运行时变量值在预览和播放器中单独维护。删除或改名不会自动修复节点引用，校验面板会提示断链。"
      type="info"
      :closable="false"
      show-icon
    />

    <el-table :data="project.variables ?? []" class="variable-table">
      <el-table-column label="变量名" min-width="160">
        <template #default="{ row }">
          <el-input :model-value="row.name" @change="(value: string) => handleUpdateVariable(row, { name: value })" />
        </template>
      </el-table-column>
      <el-table-column label="类型" width="130">
        <template #default="{ row }">
          <el-select :model-value="row.type" @update:model-value="(value: VNVariableType) => handleUpdateVariable(row, { type: value, defaultValue: createDefaultVariableValue(value) })">
            <el-option v-for="type in variableTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="默认值" min-width="160">
        <template #default="{ row }">
          <el-switch v-if="row.type === 'boolean'" :model-value="Boolean(row.defaultValue)" @update:model-value="(value: boolean) => handleDefaultValueChange(row, value)" />
          <el-input-number v-else-if="row.type === 'number'" :model-value="Number(row.defaultValue)" @update:model-value="(value: number | undefined) => handleDefaultValueChange(row, value ?? 0)" />
          <el-input v-else :model-value="String(row.defaultValue)" @update:model-value="(value: string) => handleDefaultValueChange(row, value)" />
        </template>
      </el-table-column>
      <el-table-column label="说明" min-width="220">
        <template #default="{ row }">
          <el-input :model-value="row.description" @update:model-value="(value: string) => handleUpdateVariable(row, { description: value })" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="handleDeleteVariable(row.name)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
