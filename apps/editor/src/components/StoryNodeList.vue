<script setup lang="ts">
import type { StoryNode } from "@vn-engine/vn-schema";

/** 组件属性。 */
defineProps<{
  /** 剧情节点列表。 */
  nodes: StoryNode[];
  /** 当前选中的节点 id。 */
  selectedNodeId: string | null;
}>();

/** 组件事件。 */
defineEmits<{
  /** 选择节点。 */
  selectNode: [nodeId: string];
}>();
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>剧本节点</template>
    <el-scrollbar>
      <el-table :data="nodes" height="100%" highlight-current-row @row-click="(row: StoryNode) => $emit('selectNode', row.id)">
        <el-table-column prop="id" label="节点 id" min-width="180" />
        <el-table-column prop="type" label="类型" width="130" />
      </el-table>
    </el-scrollbar>
  </el-card>
</template>
