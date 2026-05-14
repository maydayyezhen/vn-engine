<script setup lang="ts">
import type { StoryNode } from "@vn-engine/vn-schema";

/** 组件属性。 */
defineProps<{
  /** 当前预览节点。 */
  node: StoryNode | null;
}>();
</script>

<template>
  <el-card class="preview-card" shadow="never">
    <template #header>预览</template>
    <div v-if="node" class="preview-content">
      <strong>{{ node.type }}</strong>
      <span>{{ "text" in node ? node.text : node.id }}</span>
    </div>
    <el-empty v-else description="暂无预览" />
  </el-card>
</template>
