<script setup lang="ts">
import type { ActionSequenceNode, VNAction, VNActionType, VNProject } from "@vn-engine/vn-schema";
import {
  addAction,
  addParallelChildAction,
  copyAction,
  deleteAction,
  moveAction,
  updateAction
} from "../../services/actionSequenceEditService";
import ActionItemEditor from "./ActionItemEditor.vue";

/** 组件属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 动作序列节点。 */
  node: ActionSequenceNode;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新动作序列节点。 */
  updateNode: [patch: Partial<ActionSequenceNode>];
}>();

/** 动作类型选项。 */
const actionTypes: VNActionType[] = ["wait", "scene", "showCharacter", "hideCharacter", "moveCharacter", "camera", "playAudio", "stopAudio"];

/** 更新动作列表。 */
function updateActions(actions: VNAction[]): void {
  emit("updateNode", { actions });
}

/** 新增动作。 */
function handleAddAction(type: VNActionType): void {
  updateActions(addAction(props.node.actions, type, props.project));
}

/** 更新动作。 */
function handleUpdateAction(actionId: string, patch: Partial<VNAction>): void {
  updateActions(updateAction(props.node.actions, actionId, patch));
}

/** 删除动作。 */
function handleDeleteAction(actionId: string): void {
  updateActions(deleteAction(props.node.actions, actionId));
}

/** 复制动作。 */
function handleCopyAction(actionId: string): void {
  updateActions(copyAction(props.node.actions, actionId));
}

/** 移动动作。 */
function handleMoveAction(actionId: string, direction: -1 | 1): void {
  updateActions(moveAction(props.node.actions, actionId, direction));
}

/** 新增并行动作子动作。 */
function handleAddParallelChild(actionId: string, type: VNActionType): void {
  updateActions(addParallelChildAction(props.node.actions, actionId, type, props.project));
}
</script>

<template>
  <div class="action-sequence-editor">
    <el-form-item label="序列名称">
      <el-input :model-value="node.name" @update:model-value="(value: string) => $emit('updateNode', { name: value })" />
    </el-form-item>
    <div class="inline-fields">
      <el-form-item label="等待动作完成">
        <el-switch :model-value="node.waitForCompletion ?? true" @update:model-value="(value: boolean) => $emit('updateNode', { waitForCompletion: value })" />
      </el-form-item>
      <el-form-item label="自动继续剧情">
        <el-switch :model-value="node.autoNext ?? true" @update:model-value="(value: boolean) => $emit('updateNode', { autoNext: value })" />
      </el-form-item>
    </div>

    <div class="action-toolbar">
      <el-select placeholder="新增动作" @change="handleAddAction">
        <el-option v-for="type in actionTypes" :key="type" :label="type" :value="type" />
      </el-select>
    </div>

    <el-empty v-if="!node.actions.length" description="当前动作序列为空" />
    <ActionItemEditor
      v-for="action in node.actions"
      :key="action.id"
      :project="project"
      :action="action"
      @update-action="handleUpdateAction"
      @delete-action="handleDeleteAction"
      @copy-action="handleCopyAction"
      @move-up="(actionId) => handleMoveAction(actionId, -1)"
      @move-down="(actionId) => handleMoveAction(actionId, 1)"
      @add-parallel-child="handleAddParallelChild"
    />
  </div>
</template>
