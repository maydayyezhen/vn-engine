<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { AssetType, VNProject } from "@vn-engine/vn-schema";
import AssetLibraryPanel from "../components/AssetLibraryPanel.vue";
import CharacterLibraryPanel from "../components/CharacterLibraryPanel.vue";
import NodePropertyPanel from "../components/NodePropertyPanel.vue";
import PreviewPanel from "../components/PreviewPanel.vue";
import ProjectToolbar from "../components/ProjectToolbar.vue";
import ProjectTree from "../components/ProjectTree.vue";
import StoryNodeList from "../components/StoryNodeList.vue";
import ValidationPanel from "../components/ValidationPanel.vue";
import WebExportPanel from "../components/WebExportPanel.vue";
import { importDesktopAssetFile } from "../desktop/desktopAssetBridge";
import { exportDesktopWebGame } from "../desktop/desktopExportBridge";
import {
  createDesktopProjectDirectory,
  getDesktopProjectRoot,
  openDesktopProjectDirectory,
  saveDesktopProject
} from "../desktop/desktopProjectBridge";
import { isDesktopRuntime } from "../desktop/isDesktopRuntime";
import { editorStore, setActiveView, setDirty, setValidationResult, type EditorView } from "../stores/editorStore";
import { currentNode, currentScript, projectStore, replaceProject, selectNode, selectScript, setProject } from "../stores/projectStore";
import { addAsset, createEmptyAsset } from "../services/assetEditService";
import { loadDemoProject } from "../services/projectLoadService";
import {
  createProjectExportFileName,
  downloadProjectJson,
  importProjectFromJsonText,
  readProjectJsonFile
} from "../services/projectImportExportService";
import {
  addDialogueNodeAfter,
  addNarrationNodeAfter,
  deleteNode,
  duplicateNode,
  selectSafeNodeAfterDelete,
  validateCurrentProject
} from "../services/scriptEditService";

/** 预览面板组件实例。 */
const previewPanelRef = ref<InstanceType<typeof PreviewPanel> | null>(null);
/** 隐藏文件输入组件实例。 */
const fileInputRef = ref<HTMLInputElement | null>(null);
/** 当前是否处于 Tauri 桌面环境。 */
const desktopMode = isDesktopRuntime();
/** 当前打开的桌面工程根目录，仅用于 UI 展示。 */
const desktopProjectRoot = ref<string | null>(null);

/** 应用新的工程内存态。 */
function applyProject(project: VNProject): void {
  setProject(project);
  setDirty(true);
  setValidationResult(validateCurrentProject(project));
}

/** 应用导入、打开或重置后的工程。 */
function loadProjectIntoEditor(project: VNProject, dirty: boolean): void {
  replaceProject(project);
  setDirty(dirty);
  setValidationResult(validateCurrentProject(project));
  previewPanelRef.value?.restart();
}

/** dirty 状态下确认是否丢弃当前修改。 */
async function confirmDiscardIfDirty(actionName: string): Promise<boolean> {
  if (!editorStore.dirty) return true;
  try {
    await ElMessageBox.confirm(`当前项目存在未保存修改，继续${actionName}会丢弃这些修改。`, "确认操作", {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning"
    });
    return true;
  } catch {
    return false;
  }
}

/** 切换主视图。 */
function handleChangeView(view: EditorView): void {
  setActiveView(view);
}

/** 切换脚本。 */
function handleSelectScript(scriptId: string): void {
  selectScript(scriptId);
  setActiveView("script");
}

/** 选择节点。 */
function handleSelectNode(nodeId: string): void {
  selectNode(nodeId);
}

/** 新增对话节点。 */
function handleAddDialogue(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addDialogueNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增旁白节点。 */
function handleAddNarration(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addNarrationNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 复制当前节点。 */
function handleDuplicateNode(): void {
  if (!projectStore.selectedNodeId) return;
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = duplicateNode(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? currentNodeId);
}

/** 删除当前节点。 */
function handleDeleteNode(): void {
  if (!projectStore.selectedNodeId) return;
  const deletedNodeId = projectStore.selectedNodeId;
  const nextProject = deleteNode(projectStore.project, projectStore.selectedScriptId, deletedNodeId);
  applyProject(nextProject);
  selectNode(selectSafeNodeAfterDelete(nextProject, projectStore.selectedScriptId, deletedNodeId));
}

/** 点击导入项目按钮。 */
async function handleImportProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("导入项目"))) return;
  fileInputRef.value?.click();
}

/** 处理导入项目文件。 */
async function handleImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  const jsonText = await readProjectJsonFile(file);
  const result = importProjectFromJsonText(jsonText);

  if (!result.ok) {
    ElMessage.error(result.message);
    return;
  }

  replaceProject(result.project);
  setValidationResult(result.validationResult);
  setDirty(false);
  previewPanelRef.value?.restart();

  if (result.validationResult.valid) {
    ElMessage.success("项目导入成功。");
  } else {
    ElMessage.warning("项目已导入，但存在校验问题。");
  }
}

/** 导出当前项目 JSON。 */
async function handleExportProject(): Promise<void> {
  const validation = validateCurrentProject(projectStore.project);
  setValidationResult(validation);

  if (!validation.valid) {
    try {
      await ElMessageBox.confirm("当前项目存在校验问题，仍然导出 JSON 吗？", "导出提醒", {
        confirmButtonText: "仍然导出",
        cancelButtonText: "取消",
        type: "warning"
      });
    } catch {
      return;
    }
  }

  downloadProjectJson(projectStore.project, createProjectExportFileName(projectStore.project));
  setDirty(false);
  ElMessage.success("项目 JSON 已导出。");
}

/** 重置为 demo 项目。 */
async function handleResetDemo(): Promise<void> {
  if (!(await confirmDiscardIfDirty("重置为 demo 项目"))) return;
  loadProjectIntoEditor(loadDemoProject(), false);
  desktopProjectRoot.value = null;
  ElMessage.success("已重置为 demo 项目。");
}

/** 从顶部工具栏重新开始预览。 */
function handleRestartPreview(): void {
  previewPanelRef.value?.restart();
}

/** 新建桌面本地工程。 */
async function handleCreateDesktopProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("新建本地工程"))) return;
  const result = await createDesktopProjectDirectory();
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "新建本地工程失败。");
    return;
  }
  desktopProjectRoot.value = result.data.rootPath;
  loadProjectIntoEditor(result.data.project, false);
  ElMessage.success("本地工程已新建。");
}

/** 打开桌面本地工程。 */
async function handleOpenDesktopProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("打开本地工程"))) return;
  const result = await openDesktopProjectDirectory();
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "打开本地工程失败。");
    return;
  }
  desktopProjectRoot.value = result.data.rootPath;
  loadProjectIntoEditor(result.data.project, false);
  ElMessage.success("本地工程已打开。");
}

/** 保存当前项目到桌面本地工程目录。 */
async function handleSaveDesktopProject(): Promise<void> {
  const result = await saveDesktopProject(projectStore.project);
  if (!result.ok) {
    ElMessage.error(result.message ?? "保存本地工程失败。");
    return;
  }
  setDirty(false);
  ElMessage.success("本地工程已保存。");
}

/** 导出桌面完整 Web 游戏包。 */
async function handleExportDesktopWebGame(): Promise<void> {
  const result = await exportDesktopWebGame(projectStore.project);
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "导出完整 Web 游戏包失败。");
    return;
  }
  ElMessage.success(`Web 游戏包已导出：${result.data.export_dir}`);
}

/** 在桌面模式导入素材文件并登记为素材元数据。 */
async function handleImportAssetFile(assetType: AssetType): Promise<void> {
  const result = await importDesktopAssetFile(assetType);
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "导入素材失败。");
    return;
  }
  const fileName = result.data.relative_path.split("/").at(-1) ?? "导入素材";
  const asset = {
    ...createEmptyAsset(assetType),
    name: fileName.replace(/\.[^.]+$/, ""),
    path: result.data.relative_path
  };
  applyProject(addAsset(projectStore.project, asset));
  ElMessage.success("素材已复制到工程 assets 并登记。");
}

onMounted(async () => {
  setValidationResult(validateCurrentProject(projectStore.project));
  const rootResult = await getDesktopProjectRoot();
  if (rootResult.ok) desktopProjectRoot.value = rootResult.data ?? null;
});
</script>

<template>
  <div class="editor-page">
    <header class="editor-toolbar-panel">
      <ProjectToolbar
        :project="projectStore.project"
        :script-id="projectStore.selectedScriptId"
        :node-id="projectStore.selectedNodeId"
        :dirty="editorStore.dirty"
        :validation-result="editorStore.validationResult"
        :active-view="editorStore.activeView"
        :desktop-mode="desktopMode"
        :desktop-root="desktopProjectRoot"
        @change-view="handleChangeView"
        @import-project="handleImportProject"
        @export-project="handleExportProject"
        @reset-demo="handleResetDemo"
        @restart-preview="handleRestartPreview"
        @create-desktop-project="handleCreateDesktopProject"
        @open-desktop-project="handleOpenDesktopProject"
        @save-desktop-project="handleSaveDesktopProject"
        @export-desktop-web-game="handleExportDesktopWebGame"
      />
      <input ref="fileInputRef" class="hidden-file-input" type="file" accept="application/json,.json,.vnproject.json" @change="handleImportFile" />
    </header>

    <template v-if="editorStore.activeView === 'script'">
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
          <PreviewPanel ref="previewPanelRef" :project="projectStore.project" />
          <ValidationPanel :result="editorStore.validationResult" />
        </div>
      </footer>
    </template>

    <main v-else-if="editorStore.activeView === 'assets'" class="editor-panel editor-resource-panel">
      <AssetLibraryPanel
        :project="projectStore.project"
        :desktop-mode="desktopMode"
        @project-change="applyProject"
        @import-asset-file="handleImportAssetFile"
      />
    </main>

    <main v-else-if="editorStore.activeView === 'characters'" class="editor-panel editor-resource-panel">
      <CharacterLibraryPanel :project="projectStore.project" @project-change="applyProject" />
    </main>

    <main v-else class="editor-panel editor-resource-panel">
      <WebExportPanel :project="projectStore.project" />
    </main>
  </div>
</template>
