<script setup lang="ts">
import type { StoryNode } from "@vn-engine/vn-schema";
import { getNodeSummary } from "../services/scriptEditService";

/** 组件属性。 */
const props = defineProps<{
  /** 剧情节点列表。 */
  nodes: StoryNode[];
  /** 当前选中的节点 id。 */
  selectedNodeId: string | null;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 选择节点。 */
  selectNode: [nodeId: string];
  /** 新增对话节点。 */
  addDialogue: [];
  /** 新增旁白节点。 */
  addNarration: [];
  /** 复制节点。 */
  duplicateNode: [];
  /** 删除节点。 */
  deleteNode: [];
}>();

/** 返回节点行样式名。 */
function getRowClassName({ row }: { row: StoryNode }): string {
  return row.id === props.selectedNodeId ? "selected-node-row" : "";
}

/** 点击节点行。 */
function handleRowClick(row: StoryNode): void {
  emit("selectNode", row.id);
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>剧本节点</span>
        <el-button-group>
          <el-button size="small" type="primary" @click="$emit('addDialogue')">新增对话</el-button>
          <el-button size="small" @click="$emit('addNarration')">新增旁白</el-button>
          <el-button size="small" :disabled="!selectedNodeId" @click="$emit('duplicateNode')">复制</el-button>
          <el-button size="small" type="danger" :disabled="!selectedNodeId" @click="$emit('deleteNode')">删除</el-button>
        </el-button-group>
      </div>
    </template>
    <el-table
      :data="nodes"
      height="100%"
      highlight-current-row
      :row-class-name="getRowClassName"
      @row-click="handleRowClick"
    >
      <el-table-column prop="type" label="类型" width="130" />
      <el-table-column prop="id" label="节点 id" min-width="180" />
      <el-table-column label="摘要" min-width="220">
        <template #default="{ row }">
          {{ getNodeSummary(row) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
