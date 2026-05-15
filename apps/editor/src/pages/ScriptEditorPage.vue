<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { AssetItem, AssetType, NodeTarget, ValidationIssue, VNProject } from "@vn-engine/vn-schema";
import AssetResourceInspectorPanel from "../components/AssetResourceInspectorPanel.vue";
import CharacterResourceInspectorPanel from "../components/CharacterResourceInspectorPanel.vue";
import NodePropertyPanel from "../components/NodePropertyPanel.vue";
import PreviewPanel from "../components/PreviewPanel.vue";
import StoryNodeList from "../components/StoryNodeList.vue";
import VariableResourceInspectorPanel from "../components/VariableResourceInspectorPanel.vue";
import WebExportPanel from "../components/WebExportPanel.vue";
import AnimationWorkspace from "../workspaces/AnimationWorkspace.vue";
import AssetPreviewPane from "../layout/AssetPreviewPane.vue";
import CenterStage from "../layout/CenterStage.vue";
import EditorWorkbench from "../layout/EditorWorkbench.vue";
import MainMenuBar from "../layout/MainMenuBar.vue";
import ResourceExplorer from "../layout/ResourceExplorer.vue";
import RightInspector from "../layout/RightInspector.vue";
import ScriptDock from "../layout/ScriptDock.vue";
import StageTabs from "../layout/StageTabs.vue";
import StatusBar from "../layout/StatusBar.vue";
import VisualStagePanel from "../layout/VisualStagePanel.vue";
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
import { layoutStore, setInspectorTab, setPreviewZoom, setScriptDockTab, setStageTab } from "../stores/layoutStore";
import { currentNode, currentScript, projectStore, replaceProject, selectNode, selectScript, setProject } from "../stores/projectStore";
import { setResourceSearchQuery, setWorkspaceSelection, workspaceStore } from "../stores/workspaceStore";
import { canRedo, canUndo, popRedo, popUndo, pushHistory, resetHistory } from "../stores/historyStore";
import { addAsset, createEmptyAsset, deleteAsset } from "../services/assetEditService";
import { addCharacter, createEmptyCharacter, deleteCharacter } from "../services/characterEditService";
import { addVariable, createEmptyVariable, deleteVariable } from "../services/variableEditService";
import { loadDemoProject, loadShowcaseProject } from "../services/projectLoadService";
import {
  createProjectExportFileName,
  downloadProjectJson,
  importProjectFromJsonText,
  readProjectJsonFile
} from "../services/projectImportExportService";
import {
  addActionSequenceNodeAfter,
  addCameraNodeAfter,
  addDialogueNodeAfter,
  addLabelNodeAfter,
  addNarrationNodeAfter,
  addPlayAnimationNodeAfter,
  addHidePropNodeAfter,
  addShowPropNodeAfter,
  deleteNode,
  duplicateNode,
  selectSafeNodeAfterDelete,
  validateCurrentProject
} from "../services/scriptEditService";
import { canMoveNodeDown, canMoveNodeUp, moveNodeDown, moveNodeUp } from "../services/nodeOrderService";
import { copyNode, cutNode, hasClipboardNode, pasteNodeAfter } from "../services/nodeClipboardService";
import { filterNodes, type NodeFilterType } from "../services/nodeSearchService";
import {
  createEditorScript,
  deleteEditorScript,
  renameEditorScript,
  setEditorStartScript
} from "../services/scriptManageService";
import { createEditorShortcutHandler } from "../services/editorShortcutService";
import { resolveTargetNodeId } from "../services/targetSelectService";
import { findAssetById, findCharacterById, findCharacterExpression } from "../services/resourceLookupService";

/** 预览面板组件实例。 */
const previewPanelRef = ref<InstanceType<typeof PreviewPanel> | null>(null);
/** 隐藏文件输入组件实例。 */
const fileInputRef = ref<HTMLInputElement | null>(null);
/** 当前是否处于 Tauri 桌面环境。 */
const desktopMode = isDesktopRuntime();
/** 当前打开的桌面工程根目录，仅用于 UI 展示。 */
const desktopProjectRoot = ref<string | null>(null);
/** 节点搜索关键字。 */
const nodeSearchQuery = ref("");
/** 节点类型筛选。 */
const nodeFilterType = ref<NodeFilterType>("all");
/** 是否存在可粘贴节点。 */
const clipboardAvailable = ref(hasClipboardNode());
/** 当前脚本筛选后的节点。 */
const filteredNodes = computed(() => filterNodes(projectStore.project, currentScript.value?.nodes ?? [], {
  query: nodeSearchQuery.value,
  type: nodeFilterType.value
}));
/** 当前节点是否可上移。 */
const selectedNodeCanMoveUp = computed(() => canMoveNodeUp(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
/** 当前节点是否可下移。 */
const selectedNodeCanMoveDown = computed(() => canMoveNodeDown(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));

/** 当前资源树选中的素材。 */
const selectedAsset = computed(() =>
  workspaceStore.selection.kind === "asset" ? findAssetById(projectStore.project, workspaceStore.selection.id) : undefined
);

/** 当前资源树选中的角色。 */
const selectedCharacter = computed(() =>
  workspaceStore.selection.kind === "character" ? findCharacterById(projectStore.project, workspaceStore.selection.id) : undefined
);

/** 当前资源树选中的变量。 */
const selectedVariable = computed(() =>
  workspaceStore.selection.kind === "variable"
    ? (projectStore.project.variables ?? []).find((variable) => variable.name === workspaceStore.selection.id)
    : undefined
);

/** 当前选中对象在检查器中的说明。 */
const inspectorSelectionLabel = computed(() => {
  if (workspaceStore.selection.kind === "asset") return selectedAsset.value ? `${selectedAsset.value.name} / ${selectedAsset.value.id}` : "未选择素材";
  if (workspaceStore.selection.kind === "character") return selectedCharacter.value ? `${selectedCharacter.value.displayName || selectedCharacter.value.name} / ${selectedCharacter.value.id}` : "未选择角色";
  if (workspaceStore.selection.kind === "variable") return selectedVariable.value ? `变量 / ${selectedVariable.value.name}` : "未选择变量";
  if (editorStore.activeView === "script") return currentNode.value ? `${currentNode.value.type} / ${currentNode.value.id}` : "未选择节点";
  if (editorStore.activeView === "export") return "导出 / 构建";
  return "属性面板";
});

/** 当前节点或工作区关联的素材，用于左下角快速预览。 */
const focusedAsset = computed<AssetItem | undefined>(() => {
  if (selectedAsset.value) return selectedAsset.value;
  if (selectedCharacter.value) {
    const expression = selectedCharacter.value.expressions?.[0];
    return findAssetById(projectStore.project, expression?.assetId);
  }
  const node = currentNode.value;
  if (!node) return projectStore.project.assets.items[0];
  if (node.type === "scene") return findAssetById(projectStore.project, node.backgroundAssetId);
  if (node.type === "showProp") return findAssetById(projectStore.project, node.assetId);
  if (node.type === "playAudio") return findAssetById(projectStore.project, node.assetId);
  if (node.type === "showCharacter") {
    const directAsset = node.assetId ? findAssetById(projectStore.project, node.assetId) : undefined;
    if (directAsset) return directAsset;
    const expression = findCharacterExpression(projectStore.project, node.characterId, node.expression);
    return findAssetById(projectStore.project, expression?.assetId);
  }
  if (node.type === "dialogue") {
    const character = findCharacterById(projectStore.project, node.characterId);
    const expression = character?.expressions?.[0];
    return findAssetById(projectStore.project, expression?.assetId);
  }
  return projectStore.project.assets.items[0];
});

/** 创建当前编辑历史快照。 */
function createHistorySnapshot() {
  return {
    project: projectStore.project,
    selectedScriptId: projectStore.selectedScriptId,
    selectedNodeId: projectStore.selectedNodeId
  };
}

/** 记录编辑前历史。 */
function recordBeforeEdit(): void {
  pushHistory(createHistorySnapshot());
}

/** 应用新的工程内存态。 */
function applyProject(project: VNProject, recordHistory = true): void {
  if (recordHistory) recordBeforeEdit();
  setProject(project);
  setDirty(true);
  setValidationResult(validateCurrentProject(project));
}

/** 应用导入、打开或重置后的工程。 */
function loadProjectIntoEditor(project: VNProject, dirty: boolean): void {
  replaceProject(project);
  resetHistory();
  setDirty(dirty);
  setValidationResult(validateCurrentProject(project));
  setWorkspaceSelection({ kind: "script", id: project.startScriptId });
  setInspectorTab("properties");
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
  setScriptDockTab("script");
  if (view === "export") setInspectorTab("export");
  else setInspectorTab("properties");
}

/** 打开动画模块工作区。 */
function handleOpenAnimations(): void {
  setActiveView("script");
  setScriptDockTab("script");
  setInspectorTab("animations");
}

/** 处理顶部菜单命令。 */
function handleMenuCommand(command: string): void {
  if (command === "createDesktopProject") void handleCreateDesktopProject();
  if (command === "openDesktopProject") void handleOpenDesktopProject();
  if (command === "save") handleShortcutSave();
  if (command === "importProject") void handleImportProject();
  if (command === "exportProject") void handleExportProject();
  if (command === "loadShowcase") void handleLoadShowcase();
  if (command === "resetDemo") void handleResetDemo();
  if (command === "undo") handleUndo();
  if (command === "redo") handleRedo();
  if (command === "restartPreview") handleRestartPreview();
  if (command === "exportWeb") {
    setActiveView("export");
    setInspectorTab("export");
  }
  if (command === "exportDesktopWebGame") void handleExportDesktopWebGame();
}

/** 切换脚本。 */
function handleSelectScript(scriptId: string): void {
  selectScript(scriptId);
  setActiveView("script");
  setWorkspaceSelection({ kind: "script", id: scriptId });
  setInspectorTab("properties");
}

/** 选择左侧资源树中的具体素材。 */
function handleSelectAsset(assetId: string): void {
  setWorkspaceSelection({ kind: "asset", id: assetId });
  setInspectorTab("assets");
}

/** 选择左侧资源树中的具体角色。 */
function handleSelectCharacter(characterId: string): void {
  setWorkspaceSelection({ kind: "character", id: characterId });
  setInspectorTab("characters");
}

/** 选择左侧资源树中的具体变量。 */
function handleSelectVariable(variableName: string): void {
  setWorkspaceSelection({ kind: "variable", id: variableName });
  setInspectorTab("variables");
}

/** 从左侧资源树新增素材。 */
function handleCreateAsset(assetType: AssetType): void {
  if (desktopMode) {
    void handleImportAssetFile(assetType);
    return;
  }
  const asset = createEmptyAsset(assetType);
  const nextProject = addAsset(projectStore.project, asset);
  applyProject(nextProject);
  setWorkspaceSelection({ kind: "asset", id: asset.id });
  setInspectorTab("assets");
}

/** 从左侧资源树删除素材。 */
async function handleDeleteAsset(assetId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("删除素材不会自动清理节点引用，相关问题会由校验面板提示。继续删除？", "删除素材", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteAsset(projectStore.project, assetId));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 从左侧资源树新增角色。 */
function handleCreateCharacter(): void {
  const character = createEmptyCharacter();
  const nextProject = addCharacter(projectStore.project, character);
  applyProject(nextProject);
  setWorkspaceSelection({ kind: "character", id: character.id });
  setInspectorTab("characters");
}

/** 从左侧资源树删除角色。 */
async function handleDeleteCharacterFromTree(characterId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("删除角色不会自动清理剧情节点引用，相关问题会由校验面板提示。继续删除？", "删除角色", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteCharacter(projectStore.project, characterId));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 从左侧资源树新增变量。 */
function handleCreateVariable(): void {
  const variable = createEmptyVariable(projectStore.project.variables ?? []);
  const nextProject = addVariable(projectStore.project, variable);
  applyProject(nextProject);
  setWorkspaceSelection({ kind: "variable", id: variable.name });
  setInspectorTab("variables");
}

/** 从左侧资源树删除变量。 */
async function handleDeleteVariableFromTree(variableName: string): Promise<void> {
  try {
    await ElMessageBox.confirm("删除变量不会自动清理条件或赋值节点引用，相关问题会由校验面板提示。继续删除？", "删除变量", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteVariable(projectStore.project, variableName));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 选择节点。 */
function handleSelectNode(nodeId: string): void {
  selectNode(nodeId);
}

/** 恢复历史快照。 */
function restoreHistorySnapshot(snapshot: ReturnType<typeof createHistorySnapshot>): void {
  replaceProject(snapshot.project);
  selectScript(snapshot.selectedScriptId);
  selectNode(snapshot.selectedNodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(projectStore.project));
  previewPanelRef.value?.restart();
}

/** 撤销编辑。 */
function handleUndo(): void {
  const snapshot = popUndo(createHistorySnapshot());
  if (!snapshot) return;
  restoreHistorySnapshot(snapshot);
}

/** 重做编辑。 */
function handleRedo(): void {
  const snapshot = popRedo(createHistorySnapshot());
  if (!snapshot) return;
  restoreHistorySnapshot(snapshot);
}

/** 新建脚本。 */
async function handleCreateScript(): Promise<void> {
  const result = await ElMessageBox.prompt("请输入脚本名称", "新建脚本", {
    confirmButtonText: "新建",
    cancelButtonText: "取消",
    inputValue: "新脚本"
  }).catch(() => null);
  if (!result) return;
  recordBeforeEdit();
  const next = createEditorScript(projectStore.project, result.value);
  setProject(next.project);
  selectScript(next.scriptId);
  selectNode(next.nodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(next.project));
}

/** 重命名脚本。 */
async function handleRenameScript(scriptId: string): Promise<void> {
  const script = projectStore.project.scripts.find((item) => item.id === scriptId);
  if (!script) return;
  const result = await ElMessageBox.prompt("请输入新的脚本显示名称", "重命名脚本", {
    confirmButtonText: "保存",
    cancelButtonText: "取消",
    inputValue: script.name || script.id
  }).catch(() => null);
  if (!result) return;
  applyProject(renameEditorScript(projectStore.project, scriptId, result.value));
}

/** 删除脚本。 */
async function handleDeleteScript(scriptId: string): Promise<void> {
  if (projectStore.project.scripts.length <= 1) {
    ElMessage.warning("不能删除最后一个脚本。");
    return;
  }
  try {
    await ElMessageBox.confirm("删除脚本后，引用它的跳转会由校验面板提示。继续删除？", "删除脚本", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return;
  }
  recordBeforeEdit();
  const result = deleteEditorScript(projectStore.project, scriptId);
  if (!result.changed) return;
  setProject(result.project);
  selectScript(result.scriptId);
  selectNode(result.nodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(result.project));
}

/** 设置入口脚本。 */
function handleSetStartScript(scriptId: string): void {
  applyProject(setEditorStartScript(projectStore.project, scriptId));
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

/** 新增镜头节点。 */
function handleAddCamera(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addCameraNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增标签节点。 */
/** 新增动作序列节点。 */
function handleAddActionSequence(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addActionSequenceNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增代码型动画节点。 */
function handleAddPlayAnimation(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addPlayAnimationNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增物品显示节点。 */
function handleAddShowProp(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addShowPropNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 新增物品隐藏节点。 */
function handleAddHideProp(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addHidePropNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

function handleAddLabel(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addLabelNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
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

/** 复制当前节点到内部剪贴板。 */
function handleCopyNode(): void {
  if (!copyNode(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId)) return;
  clipboardAvailable.value = hasClipboardNode();
  ElMessage.success("节点已复制。");
}

/** 剪切当前节点。 */
function handleCutNode(): void {
  recordBeforeEdit();
  const result = cutNode(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  if (!result.ok) return;
  setProject(result.project);
  selectNode(result.selectedNodeId);
  clipboardAvailable.value = hasClipboardNode();
  setDirty(true);
  setValidationResult(validateCurrentProject(result.project));
}

/** 粘贴节点到当前节点之后。 */
function handlePasteNode(): void {
  recordBeforeEdit();
  const result = pasteNodeAfter(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  if (!result.ok) return;
  setProject(result.project);
  selectNode(result.nodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(result.project));
}

/** 上移当前节点。 */
function handleMoveNodeUp(): void {
  if (!projectStore.selectedNodeId) return;
  applyProject(moveNodeUp(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
  selectNode(projectStore.selectedNodeId);
}

/** 下移当前节点。 */
function handleMoveNodeDown(): void {
  if (!projectStore.selectedNodeId) return;
  applyProject(moveNodeDown(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
  selectNode(projectStore.selectedNodeId);
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
  resetHistory();
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

/** 加载 Showcase Demo 项目。 */
async function handleLoadShowcase(): Promise<void> {
  if (!(await confirmDiscardIfDirty("加载 Showcase Demo"))) return;
  loadProjectIntoEditor(loadShowcaseProject(), false);
  desktopProjectRoot.value = null;
  setActiveView("script");
  ElMessage.success("已加载 Showcase Demo。");
}

/** 从顶部菜单或快捷入口重新开始预览。 */
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
  setWorkspaceSelection({ kind: "asset", id: asset.id });
  setInspectorTab("assets");
  ElMessage.success("素材已复制到工程 assets 并登记。");
}

/** 定位校验问题到脚本和节点。 */
function handleLocateValidationIssue(issue: ValidationIssue): void {
  if (issue.scriptId && projectStore.project.scripts.some((script) => script.id === issue.scriptId)) {
    selectScript(issue.scriptId);
    setActiveView("script");
  }
  if (issue.nodeId) selectNode(issue.nodeId);
}

/** 定位节点或标签跳转目标。 */
function handleLocateTarget(target: NodeTarget): void {
  const nodeId = resolveTargetNodeId(projectStore.project, target);
  if (!nodeId) {
    ElMessage.warning("目标不存在，无法定位。");
    return;
  }
  selectScript(target.scriptId);
  selectNode(nodeId);
  setActiveView("script");
}

/** 聚焦节点搜索框。 */
function focusNodeSearch(): void {
  document.querySelector<HTMLInputElement>("#node-search-input")?.focus();
}

/** 保存快捷键入口。 */
function handleShortcutSave(): void {
  if (desktopMode) {
    void handleSaveDesktopProject();
  } else {
    void handleExportProject();
  }
}

/** 编辑器快捷键监听器。 */
const shortcutHandler = createEditorShortcutHandler({
  save: handleShortcutSave,
  undo: handleUndo,
  redo: handleRedo,
  copy: handleCopyNode,
  cut: handleCutNode,
  paste: handlePasteNode,
  deleteNode: handleDeleteNode,
  focusSearch: focusNodeSearch
});

onMounted(async () => {
  setValidationResult(validateCurrentProject(projectStore.project));
  const rootResult = await getDesktopProjectRoot();
  if (rootResult.ok) desktopProjectRoot.value = rootResult.data ?? null;
  window.addEventListener("keydown", shortcutHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", shortcutHandler);
});
</script>

<template>
  <EditorWorkbench>
    <template #menu>
      <MainMenuBar
        :desktop-mode="desktopMode"
        @command="handleMenuCommand"
        @change-view="handleChangeView"
      />
      <input ref="fileInputRef" class="hidden-file-input" type="file" accept="application/json,.json,.vnproject.json" @change="handleImportFile" />
    </template>

    <template #explorer>
      <ResourceExplorer
        :project="projectStore.project"
        :selected-script-id="projectStore.selectedScriptId"
        :selection="workspaceStore.selection"
        :search-query="workspaceStore.resourceSearchQuery"
        @update-search-query="setResourceSearchQuery"
        @select-script="handleSelectScript"
        @select-asset="handleSelectAsset"
        @select-character="handleSelectCharacter"
        @select-variable="handleSelectVariable"
        @create-script="handleCreateScript"
        @rename-script="handleRenameScript"
        @delete-script="handleDeleteScript"
        @set-start-script="handleSetStartScript"
        @create-asset="handleCreateAsset"
        @delete-asset="handleDeleteAsset"
        @create-character="handleCreateCharacter"
        @delete-character="handleDeleteCharacterFromTree"
        @create-variable="handleCreateVariable"
        @delete-variable="handleDeleteVariableFromTree"
      >
        <template #preview>
          <AssetPreviewPane :asset="focusedAsset" :assets="projectStore.project.assets.items" />
        </template>
      </ResourceExplorer>
    </template>

    <template #center>
      <CenterStage>
        <template #tabs>
          <StageTabs :model-value="layoutStore.stageTab" @update:model-value="setStageTab" />
        </template>
        <template #visual>
          <VisualStagePanel
            :stage-tab="layoutStore.stageTab"
            :zoom="layoutStore.previewZoom"
            @update-zoom="setPreviewZoom"
          >
            <PreviewPanel ref="previewPanelRef" :project="projectStore.project" />
          </VisualStagePanel>
        </template>
        <template #dock>
          <ScriptDock
            :active-view="editorStore.activeView"
            :active-tab="layoutStore.scriptDockTab"
            @update-active-tab="setScriptDockTab"
          >
            <template #script>
              <StoryNodeList
                :nodes="filteredNodes"
                :selected-node-id="projectStore.selectedNodeId"
                :search-query="nodeSearchQuery"
                :filter-type="nodeFilterType"
                :can-undo="canUndo"
                :can-redo="canRedo"
                :can-paste="clipboardAvailable"
                :can-move-up="selectedNodeCanMoveUp"
                :can-move-down="selectedNodeCanMoveDown"
                @select-node="handleSelectNode"
                @add-dialogue="handleAddDialogue"
                @add-narration="handleAddNarration"
                @add-camera="handleAddCamera"
                @add-action-sequence="handleAddActionSequence"
                @add-play-animation="handleAddPlayAnimation"
                @add-show-prop="handleAddShowProp"
                @add-hide-prop="handleAddHideProp"
                @add-label="handleAddLabel"
                @duplicate-node="handleCopyNode"
                @cut-node="handleCutNode"
                @paste-node="handlePasteNode"
                @delete-node="handleDeleteNode"
                @move-node-up="handleMoveNodeUp"
                @move-node-down="handleMoveNodeDown"
                @undo="handleUndo"
                @redo="handleRedo"
                @update-search-query="nodeSearchQuery = $event"
                @update-filter-type="nodeFilterType = $event"
              />
            </template>
          </ScriptDock>
        </template>
      </CenterStage>
    </template>

    <template #inspector>
      <RightInspector
        :selection-label="inspectorSelectionLabel"
        :active-tab="layoutStore.inspectorTab"
        :show-asset-tab="workspaceStore.selection.kind === 'asset'"
        :show-character-tab="workspaceStore.selection.kind === 'character'"
        :show-variable-tab="workspaceStore.selection.kind === 'variable'"
        :show-export-tab="editorStore.activeView === 'export'"
        :show-animation-tab="layoutStore.inspectorTab === 'animations'"
        @update-active-tab="setInspectorTab"
      >
        <template #properties>
          <NodePropertyPanel
            v-if="editorStore.activeView === 'script'"
            :project="projectStore.project"
            :script-id="projectStore.selectedScriptId"
            :node="currentNode"
            @project-change="applyProject"
            @locate-target="handleLocateTarget"
          />
          <div v-else class="inspector-empty-state">
            <strong>{{ inspectorSelectionLabel }}</strong>
            <span>该工作区的编辑表单位于中央下方。校验摘要已移动到底部状态栏。</span>
          </div>
        </template>
        <template #assets>
          <AssetResourceInspectorPanel
            :project="projectStore.project"
            :asset="selectedAsset"
            @project-change="applyProject"
          />
        </template>
        <template #characters>
          <CharacterResourceInspectorPanel
            :project="projectStore.project"
            :character="selectedCharacter"
            @project-change="applyProject"
          />
        </template>
        <template #variables>
          <VariableResourceInspectorPanel
            :project="projectStore.project"
            :variable="selectedVariable"
            @project-change="applyProject"
          />
        </template>
        <template #export>
          <WebExportPanel :project="projectStore.project" />
        </template>
        <template #animations>
          <AnimationWorkspace />
        </template>
      </RightInspector>
    </template>

    <template #statusbar>
      <StatusBar
        :project-name="projectStore.project.name"
        :script-id="projectStore.selectedScriptId"
        :node-id="projectStore.selectedNodeId"
        :dirty="editorStore.dirty"
        :validation-result="editorStore.validationResult"
        :desktop-mode="desktopMode"
        :preview-zoom="layoutStore.previewZoom"
        @locate-issue="handleLocateValidationIssue"
      />
    </template>
  </EditorWorkbench>
</template>
