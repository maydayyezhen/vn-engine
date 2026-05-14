<script setup lang="ts">
import type { NodeTarget, VNProject } from "@vn-engine/vn-schema";
import { createLabelTarget, createNodeTarget, getLabelNodes, getTargetMode, type TargetMode } from "../../services/targetSelectService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前目标。 */
  target: NodeTarget | undefined;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新目标。 */
  updateTarget: [target: NodeTarget];
}>();

/** 获取当前脚本 id。 */
function currentScriptId(): string {
  return props.target?.scriptId || props.project.startScriptId || props.project.scripts[0]?.id || "";
}

/** 获取当前目标模式。 */
function currentMode(): TargetMode {
  return getTargetMode(props.target);
}

/** 当前脚本下可选节点。 */
function nodesForScript(scriptId: string) {
  return props.project.scripts.find((script) => script.id === scriptId)?.nodes ?? [];
}

/** 更新脚本。 */
function updateScript(scriptId: string): void {
  if (currentMode() === "label") {
    const label = getLabelNodes(props.project, scriptId)[0]?.name ?? "";
    emit("updateTarget", createLabelTarget(scriptId, label));
    return;
  }
  const nodeId = nodesForScript(scriptId)[0]?.id ?? "";
  emit("updateTarget", createNodeTarget(scriptId, nodeId));
}

/** 更新目标模式。 */
function updateMode(mode: TargetMode): void {
  const scriptId = currentScriptId();
  if (mode === "label") {
    emit("updateTarget", createLabelTarget(scriptId, getLabelNodes(props.project, scriptId)[0]?.name ?? ""));
    return;
  }
  emit("updateTarget", createNodeTarget(scriptId, nodesForScript(scriptId)[0]?.id ?? ""));
}
</script>

<template>
  <div class="target-selector">
    <el-select :model-value="currentScriptId()" filterable @update:model-value="(value: string) => updateScript(value)">
      <el-option v-for="script in project.scripts" :key="script.id" :label="`${script.name || script.id} (${script.id})`" :value="script.id" />
    </el-select>
    <el-segmented
      :model-value="currentMode()"
      :options="[
        { label: '节点', value: 'node' },
        { label: '标签', value: 'label' }
      ]"
      @update:model-value="(value: string | number | boolean | undefined) => updateMode(value as TargetMode)"
    />
    <el-select
      v-if="currentMode() === 'node'"
      :model-value="target?.nodeId"
      filterable
      @update:model-value="(value: string) => $emit('updateTarget', createNodeTarget(currentScriptId(), value))"
    >
      <el-option v-for="node in nodesForScript(currentScriptId())" :key="node.id" :label="`${node.id} (${node.type})`" :value="node.id" />
    </el-select>
    <el-select
      v-else
      :model-value="target?.label"
      filterable
      @update:model-value="(value: string) => $emit('updateTarget', createLabelTarget(currentScriptId(), value))"
    >
      <el-option v-for="label in getLabelNodes(project, currentScriptId())" :key="label.id" :label="`${label.name} (${label.id})`" :value="label.name" />
    </el-select>
  </div>
</template>
