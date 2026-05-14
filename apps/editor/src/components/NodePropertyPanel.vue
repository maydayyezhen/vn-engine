<script setup lang="ts">
import type { StoryNode } from "@vn-engine/vn-schema";

/** 组件属性。 */
defineProps<{
  /** 当前选中的剧情节点。 */
  node: StoryNode | null;
}>();
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>节点属性</template>
    <el-empty v-if="!node" description="请选择节点" />
    <el-descriptions v-else :column="1" border>
      <el-descriptions-item label="id">{{ node.id }}</el-descriptions-item>
      <el-descriptions-item label="type">{{ node.type }}</el-descriptions-item>
      <el-descriptions-item label="JSON">
        <pre>{{ JSON.stringify(node, null, 2) }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
