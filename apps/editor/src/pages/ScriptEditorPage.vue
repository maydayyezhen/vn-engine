<script setup lang="ts">
import { computed } from "vue";
import NodePropertyPanel from "../components/NodePropertyPanel.vue";
import PreviewPanel from "../components/PreviewPanel.vue";
import ProjectTree from "../components/ProjectTree.vue";
import StoryNodeList from "../components/StoryNodeList.vue";
import { editorStore } from "../stores/editorStore";
import { projectStore } from "../stores/projectStore";
import { findStoryNode, listStoryNodes } from "../services/scriptEditService";

/** 当前节点列表。 */
const nodes = computed(() => listStoryNodes(projectStore.currentScript));
/** 当前选中节点。 */
const selectedNode = computed(() => findStoryNode(projectStore.currentScript, editorStore.selectedNodeId));

/** 选择节点。 */
function selectNode(nodeId: string): void {
  editorStore.selectedNodeId = nodeId;
}
</script>

<template>
  <el-container class="editor-page">
    <el-aside width="260px" class="editor-aside">
      <ProjectTree :project="projectStore.project" />
    </el-aside>
    <el-container>
      <el-main class="editor-main">
        <StoryNodeList :nodes="nodes" :selected-node-id="editorStore.selectedNodeId" @select-node="selectNode" />
      </el-main>
      <el-aside width="360px" class="editor-aside">
        <NodePropertyPanel :node="selectedNode" />
      </el-aside>
      <el-footer height="180px" class="editor-footer">
        <PreviewPanel :node="selectedNode" />
      </el-footer>
    </el-container>
  </el-container>
</template>
