<script setup lang="ts">
import type { ParallelAction, VNAction, VNActionType, VNProject } from "@vn-engine/vn-schema";
import ActionItemEditor from "./ActionItemEditor.vue";

/** 组件属性。 */
defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 并行动作。 */
  action: ParallelAction;
}>();

/** 组件事件。 */
defineEmits<{
  /** 更新动作。 */
  updateAction: [actionId: string, patch: Partial<VNAction>];
  /** 删除动作。 */
  deleteAction: [actionId: string];
  /** 复制动作。 */
  copyAction: [actionId: string];
  /** 上移动作。 */
  moveUp: [actionId: string];
  /** 下移动作。 */
  moveDown: [actionId: string];
  /** 新增并行动作子动作。 */
  addParallelChild: [actionId: string, type: VNActionType];
}>();
</script>

<template>
  <ActionItemEditor
    :project="project"
    :action="action"
    @update-action="(...args) => $emit('updateAction', ...args)"
    @delete-action="(...args) => $emit('deleteAction', ...args)"
    @copy-action="(...args) => $emit('copyAction', ...args)"
    @move-up="(...args) => $emit('moveUp', ...args)"
    @move-down="(...args) => $emit('moveDown', ...args)"
    @add-parallel-child="(...args) => $emit('addParallelChild', ...args)"
  />
</template>
