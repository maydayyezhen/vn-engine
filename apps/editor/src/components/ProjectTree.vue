<script setup lang="ts">
import type { VNProject } from "@vn-engine/vn-schema";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
}>();

/** Element Plus 树节点数据。 */
const treeData = [
  {
    label: props.project.name,
    children: [
      { label: "素材库", children: props.project.assets.items.map((asset) => ({ label: asset.name })) },
      { label: "角色", children: props.project.characters.map((character) => ({ label: character.name })) },
      { label: "剧本", children: props.project.scripts.map((script) => ({ label: script.name })) }
    ]
  }
];
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>项目资源</template>
    <el-tree :data="treeData" default-expand-all />
  </el-card>
</template>
