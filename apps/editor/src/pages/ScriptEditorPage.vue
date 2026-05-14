<script setup lang="ts">
import { onMounted } from "vue";
import NodePropertyPanel from "../components/NodePropertyPanel.vue";
import PreviewPanel from "../components/PreviewPanel.vue";
import ProjectTree from "../components/ProjectTree.vue";
import StoryNodeList from "../components/StoryNodeList.vue";
import ValidationPanel from "../components/ValidationPanel.vue";
import { editorStore, setDirty, setValidationResult } from "../stores/editorStore";
import { currentNode, currentScript, projectStore, selectNode, selectScript, setProject } from "../stores/projectStore";
import {
  addDialogueNodeAfter,
  addNarrationNodeAfter,
  deleteNode,
  duplicateNode,
  selectSafeNodeAfterDelete,
  validateCurrentProject
} from "../services/scriptEditService";
import type { VNProject } from "@vn-engine/vn-schema";

/** 应用新的工程内存态。 */
function applyProject(project: VNProject): void {
  setProject(project);
  setDirty(true);
  setValidationResult(validateCurrentProject(project));
}

/** 切换脚本。 */
function handleSelectScript(scriptId: string): void {
  selectScript(scriptId);
}

/** 选择节点。 */
function handleSelectNode(nodeId: string): void {
  selectNode(nodeId);
}

/** 新增对话节点。 */
function handleAddDialogue(): void {
  const nextProject = addDialogueNodeAfter(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  selectNode(script?.nodes.at((script.nodes.findIndex((node) => node.id === projectStore.selectedNodeId) ?? -1) + 1)?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增旁白节点。 */
function handleAddNarration(): void {
  const nextProject = addNarrationNodeAfter(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  selectNode(script?.nodes.at((script.nodes.findIndex((node) => node.id === projectStore.selectedNodeId) ?? -1) + 1)?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 复制当前节点。 */
function handleDuplicateNode(): void {
  if (!projectStore.selectedNodeId) return;
  const nextProject = duplicateNode(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === projectStore.selectedNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? projectStore.selectedNodeId);
}

/** 删除当前节点。 */
function handleDeleteNode(): void {
  if (!projectStore.selectedNodeId) return;
  const deletedNodeId = projectStore.selectedNodeId;
  const nextProject = deleteNode(projectStore.project, projectStore.selectedScriptId, deletedNodeId);
  applyProject(nextProject);
  selectNode(selectSafeNodeAfterDelete(nextProject, projectStore.selectedScriptId, deletedNodeId));
}

onMounted(() => {
  setValidationResult(validateCurrentProject(projectStore.project));
});
</script>

<template>
  <div class="editor-page">
    <aside class="editor-panel editor-project-panel">
      <ProjectTree :project="projectStore.project" :selected-script-id="projectStore.selectedScriptId" @select-script="handleSelectScript" />
    </aside>
    <main class="editor-panel editor-node-panel">
      <StoryNodeList
        :nodes="currentScript?.nodes ?? []"
        :selected-node-id="projectStore.selectedNodeId"
        @select-node="handleSelectNode"
        @add-dialogue="handleAddDialogue"
        @add-narration="handleAddNarration"
        @duplicate-node="handleDuplicateNode"
        @delete-node="handleDeleteNode"
      />
    </main>
    <aside class="editor-panel editor-property-panel">
      <NodePropertyPanel
        :project="projectStore.project"
        :script-id="projectStore.selectedScriptId"
        :node="currentNode"
        @project-change="applyProject"
      />
    </aside>
    <footer class="editor-panel editor-footer-panel">
      <div class="footer-grid">
        <PreviewPanel :project="projectStore.project" />
        <ValidationPanel :result="editorStore.validationResult" />
      </div>
    </footer>
  </div>
</template>
