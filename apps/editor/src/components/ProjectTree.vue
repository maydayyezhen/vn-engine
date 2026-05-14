<script setup lang="ts">
import { computed } from "vue";
import type { VNProject } from "@vn-engine/vn-schema";

/** 项目树节点数据。 */
interface ProjectTreeNode {
  /** 节点唯一 key。 */
  key: string;
  /** 节点显示文本。 */
  label: string;
  /** 节点类型。 */
  kind: "project" | "group" | "script" | "character" | "asset";
  /** 关联脚本 id。 */
  scriptId?: string;
  /** 子节点。 */
  children?: ProjectTreeNode[];
}

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前选中的脚本 id。 */
  selectedScriptId: string;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 选择脚本。 */
  selectScript: [scriptId: string];
}>();

/** Element Plus 树节点数据。 */
const treeData = computed<ProjectTreeNode[]>(() => [
  {
    key: `project:${props.project.id}`,
    label: props.project.name,
    kind: "project",
    children: [
      {
        key: "group:scripts",
        label: "脚本",
        kind: "group",
        children: props.project.scripts.map((script) => ({
          key: `script:${script.id}`,
          label: script.name,
          kind: "script",
          scriptId: script.id
        }))
      },
      {
        key: "group:characters",
        label: "角色",
        kind: "group",
        children: props.project.characters.map((character) => ({
          key: `character:${character.id}`,
          label: character.name,
          kind: "character"
        }))
      },
      {
        key: "group:assets",
        label: "素材",
        kind: "group",
        children: props.project.assets.items.map((asset) => ({
          key: `asset:${asset.id}`,
          label: `${asset.name} (${asset.type})`,
          kind: "asset"
        }))
      }
    ]
  }
]);

/** 点击项目树节点。 */
function handleNodeClick(node: ProjectTreeNode): void {
  if (node.kind === "script" && node.scriptId) {
    emit("selectScript", node.scriptId);
  }
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>项目资源</template>
    <el-tree
      :data="treeData"
      node-key="key"
      default-expand-all
      :current-node-key="`script:${selectedScriptId}`"
      highlight-current
      @node-click="handleNodeClick"
    />
  </el-card>
</template>
