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

/** 棰勮闈㈡澘缁勪欢瀹炰緥銆?*/
const previewPanelRef = ref<InstanceType<typeof PreviewPanel> | null>(null);
/** 闅愯棌鏂囦欢杈撳叆缁勪欢瀹炰緥銆?*/
const fileInputRef = ref<HTMLInputElement | null>(null);
/** 褰撳墠鏄惁澶勪簬 Tauri 妗岄潰鐜銆?*/
const desktopMode = isDesktopRuntime();
/** 褰撳墠鎵撳紑鐨勬闈㈠伐绋嬫牴鐩綍锛屼粎鐢ㄤ簬 UI 灞曠ず銆?*/
const desktopProjectRoot = ref<string | null>(null);
/** 鑺傜偣鎼滅储鍏抽敭瀛椼€?*/
const nodeSearchQuery = ref("");
/** 鑺傜偣绫诲瀷绛涢€夈€?*/
const nodeFilterType = ref<NodeFilterType>("all");
/** 鏄惁瀛樺湪鍙矘璐磋妭鐐广€?*/
const clipboardAvailable = ref(hasClipboardNode());
/** 工作台与中间面板实例：用于恢复初始布局 */
const workbenchRef = ref<InstanceType<typeof EditorWorkbench> | null>(null);
const centerStageRef = ref<InstanceType<typeof CenterStage> | null>(null);
/** 褰撳墠鑴氭湰绛涢€夊悗鐨勮妭鐐广€?*/
const filteredNodes = computed(() => filterNodes(projectStore.project, currentScript.value?.nodes ?? [], {
  query: nodeSearchQuery.value,
  type: nodeFilterType.value
}));
/** 褰撳墠鑺傜偣鏄惁鍙笂绉汇€?*/
const selectedNodeCanMoveUp = computed(() => canMoveNodeUp(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
/** 褰撳墠鑺傜偣鏄惁鍙笅绉汇€?*/
const selectedNodeCanMoveDown = computed(() => canMoveNodeDown(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));

/** 褰撳墠璧勬簮鏍戦€変腑鐨勭礌鏉愩€?*/
const selectedAsset = computed(() =>
  workspaceStore.selection.kind === "asset" ? findAssetById(projectStore.project, workspaceStore.selection.id) : undefined
);

/** 褰撳墠璧勬簮鏍戦€変腑鐨勮鑹层€?*/
const selectedCharacter = computed(() =>
  workspaceStore.selection.kind === "character" ? findCharacterById(projectStore.project, workspaceStore.selection.id) : undefined
);

/** 褰撳墠璧勬簮鏍戦€変腑鐨勫彉閲忋€?*/
const selectedVariable = computed(() =>
  workspaceStore.selection.kind === "variable"
    ? (projectStore.project.variables ?? []).find((variable) => variable.name === workspaceStore.selection.id)
    : undefined
);

/** 褰撳墠閫変腑瀵硅薄鍦ㄦ鏌ュ櫒涓殑璇存槑銆?*/
const inspectorSelectionLabel = computed(() => {
  if (workspaceStore.selection.kind === "asset") return selectedAsset.value ? `${selectedAsset.value.name} / ${selectedAsset.value.id}` : "鏈€夋嫨绱犳潗";
  if (workspaceStore.selection.kind === "character") return selectedCharacter.value ? `${selectedCharacter.value.displayName || selectedCharacter.value.name} / ${selectedCharacter.value.id}` : "鏈€夋嫨瑙掕壊";
  if (workspaceStore.selection.kind === "variable") return selectedVariable.value ? `鍙橀噺 / ${selectedVariable.value.name}` : "鏈€夋嫨鍙橀噺";
  if (editorStore.activeView === "script") return currentNode.value ? `${currentNode.value.type} / ${currentNode.value.id}` : "鏈€夋嫨鑺傜偣";
  if (editorStore.activeView === "export") return "瀵煎嚭 / 鏋勫缓";
  return "属性面板";
});

/** 褰撳墠鑺傜偣鎴栧伐浣滃尯鍏宠仈鐨勭礌鏉愶紝鐢ㄤ簬宸︿笅瑙掑揩閫熼瑙堛€?*/
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

/** 鍒涘缓褰撳墠缂栬緫鍘嗗彶蹇収銆?*/
function createHistorySnapshot() {
  return {
    project: projectStore.project,
    selectedScriptId: projectStore.selectedScriptId,
    selectedNodeId: projectStore.selectedNodeId
  };
}

/** 璁板綍缂栬緫鍓嶅巻鍙层€?*/
function recordBeforeEdit(): void {
  pushHistory(createHistorySnapshot());
}

/** 搴旂敤鏂扮殑宸ョ▼鍐呭瓨鎬併€?*/
function applyProject(project: VNProject, recordHistory = true): void {
  if (recordHistory) recordBeforeEdit();
  setProject(project);
  setDirty(true);
  setValidationResult(validateCurrentProject(project));
}

/** 搴旂敤瀵煎叆銆佹墦寮€鎴栭噸缃悗鐨勫伐绋嬨€?*/
function loadProjectIntoEditor(project: VNProject, dirty: boolean): void {
  replaceProject(project);
  resetHistory();
  setDirty(dirty);
  setValidationResult(validateCurrentProject(project));
  setWorkspaceSelection({ kind: "script", id: project.startScriptId });
  setInspectorTab("properties");
  previewPanelRef.value?.restart();
}

/** dirty 鐘舵€佷笅纭鏄惁涓㈠純褰撳墠淇敼銆?*/
async function confirmDiscardIfDirty(actionName: string): Promise<boolean> {
  if (!editorStore.dirty) return true;
  try {
    await ElMessageBox.confirm(`褰撳墠椤圭洰瀛樺湪鏈繚瀛樹慨鏀癸紝缁х画${actionName}浼氫涪寮冭繖浜涗慨鏀广€俙, "纭鎿嶄綔", {
      confirmButtonText: "缁х画",
      cancelButtonText: "鍙栨秷",
      type: "warning"
    });
    return true;
  } catch {
    return false;
  }
}

/** 鍒囨崲涓昏鍥俱€?*/
function handleChangeView(view: EditorView): void {
  setActiveView(view);
  setScriptDockTab("script");
  if (view === "export") setInspectorTab("export");
  else setInspectorTab("properties");
}

/** 鎵撳紑鍔ㄧ敾妯″潡宸ヤ綔鍖恒€?*/
function handleOpenAnimations(): void {
  setActiveView("script");
  setScriptDockTab("script");
  setInspectorTab("animations");
}

/** 澶勭悊椤堕儴鑿滃崟鍛戒护銆?*/
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
  if (command === "resetLayout") {
    workbenchRef.value?.resetLayout();
    centerStageRef.value?.resetLayout();
    window.dispatchEvent(new Event("vn-editor-reset-layout"));
  }
  if (command === "exportWeb") {
    setActiveView("export");
    setInspectorTab("export");
  }
  if (command === "exportDesktopWebGame") void handleExportDesktopWebGame();
}

/** 鍒囨崲鑴氭湰銆?*/
function handleSelectScript(scriptId: string): void {
  selectScript(scriptId);
  setActiveView("script");
  setWorkspaceSelection({ kind: "script", id: scriptId });
  setInspectorTab("properties");
}

/** 閫夋嫨宸︿晶璧勬簮鏍戜腑鐨勫叿浣撶礌鏉愩€?*/
function handleSelectAsset(assetId: string): void {
  setWorkspaceSelection({ kind: "asset", id: assetId });
  setInspectorTab("assets");
}

/** 閫夋嫨宸︿晶璧勬簮鏍戜腑鐨勫叿浣撹鑹层€?*/
function handleSelectCharacter(characterId: string): void {
  setWorkspaceSelection({ kind: "character", id: characterId });
  setInspectorTab("characters");
}

/** 閫夋嫨宸︿晶璧勬簮鏍戜腑鐨勫叿浣撳彉閲忋€?*/
function handleSelectVariable(variableName: string): void {
  setWorkspaceSelection({ kind: "variable", id: variableName });
  setInspectorTab("variables");
}

/** 浠庡乏渚ц祫婧愭爲鏂板绱犳潗銆?*/
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

/** 浠庡乏渚ц祫婧愭爲鍒犻櫎绱犳潗銆?*/
async function handleDeleteAsset(assetId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("鍒犻櫎绱犳潗涓嶄細鑷姩娓呯悊鑺傜偣寮曠敤锛岀浉鍏抽棶棰樹細鐢辨牎楠岄潰鏉挎彁绀恒€傜户缁垹闄わ紵", "鍒犻櫎绱犳潗", {
      confirmButtonText: "鍒犻櫎",
      cancelButtonText: "鍙栨秷",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteAsset(projectStore.project, assetId));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 浠庡乏渚ц祫婧愭爲鏂板瑙掕壊銆?*/
function handleCreateCharacter(): void {
  const character = createEmptyCharacter();
  const nextProject = addCharacter(projectStore.project, character);
  applyProject(nextProject);
  setWorkspaceSelection({ kind: "character", id: character.id });
  setInspectorTab("characters");
}

/** 浠庡乏渚ц祫婧愭爲鍒犻櫎瑙掕壊銆?*/
async function handleDeleteCharacterFromTree(characterId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("鍒犻櫎瑙掕壊涓嶄細鑷姩娓呯悊鍓ф儏鑺傜偣寮曠敤锛岀浉鍏抽棶棰樹細鐢辨牎楠岄潰鏉挎彁绀恒€傜户缁垹闄わ紵", "鍒犻櫎瑙掕壊", {
      confirmButtonText: "鍒犻櫎",
      cancelButtonText: "鍙栨秷",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteCharacter(projectStore.project, characterId));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 浠庡乏渚ц祫婧愭爲鏂板鍙橀噺銆?*/
function handleCreateVariable(): void {
  const variable = createEmptyVariable(projectStore.project.variables ?? []);
  const nextProject = addVariable(projectStore.project, variable);
  applyProject(nextProject);
  setWorkspaceSelection({ kind: "variable", id: variable.name });
  setInspectorTab("variables");
}

/** 浠庡乏渚ц祫婧愭爲鍒犻櫎鍙橀噺銆?*/
async function handleDeleteVariableFromTree(variableName: string): Promise<void> {
  try {
    await ElMessageBox.confirm("鍒犻櫎鍙橀噺涓嶄細鑷姩娓呯悊鏉′欢鎴栬祴鍊艰妭鐐瑰紩鐢紝鐩稿叧闂浼氱敱鏍￠獙闈㈡澘鎻愮ず銆傜户缁垹闄わ紵", "鍒犻櫎鍙橀噺", {
      confirmButtonText: "鍒犻櫎",
      cancelButtonText: "鍙栨秷",
      type: "warning"
    });
  } catch {
    return;
  }
  applyProject(deleteVariable(projectStore.project, variableName));
  setWorkspaceSelection({ kind: "project" });
  setInspectorTab("properties");
}

/** 閫夋嫨鑺傜偣銆?*/
function handleSelectNode(nodeId: string): void {
  selectNode(nodeId);
}

/** 鎭㈠鍘嗗彶蹇収銆?*/
function restoreHistorySnapshot(snapshot: ReturnType<typeof createHistorySnapshot>): void {
  replaceProject(snapshot.project);
  selectScript(snapshot.selectedScriptId);
  selectNode(snapshot.selectedNodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(projectStore.project));
  previewPanelRef.value?.restart();
}

/** 鎾ら攢缂栬緫銆?*/
function handleUndo(): void {
  const snapshot = popUndo(createHistorySnapshot());
  if (!snapshot) return;
  restoreHistorySnapshot(snapshot);
}

/** 閲嶅仛缂栬緫銆?*/
function handleRedo(): void {
  const snapshot = popRedo(createHistorySnapshot());
  if (!snapshot) return;
  restoreHistorySnapshot(snapshot);
}

/** 鏂板缓鑴氭湰銆?*/
async function handleCreateScript(): Promise<void> {
  const result = await ElMessageBox.prompt("璇疯緭鍏ヨ剼鏈悕绉?, "鏂板缓鑴氭湰", {
    confirmButtonText: "鏂板缓",
    cancelButtonText: "鍙栨秷",
    inputValue: "鏂拌剼鏈?
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

/** 閲嶅懡鍚嶈剼鏈€?*/
async function handleRenameScript(scriptId: string): Promise<void> {
  const script = projectStore.project.scripts.find((item) => item.id === scriptId);
  if (!script) return;
  const result = await ElMessageBox.prompt("璇疯緭鍏ユ柊鐨勮剼鏈樉绀哄悕绉?, "閲嶅懡鍚嶈剼鏈?, {
    confirmButtonText: "淇濆瓨",
    cancelButtonText: "鍙栨秷",
    inputValue: script.name || script.id
  }).catch(() => null);
  if (!result) return;
  applyProject(renameEditorScript(projectStore.project, scriptId, result.value));
}

/** 鍒犻櫎鑴氭湰銆?*/
async function handleDeleteScript(scriptId: string): Promise<void> {
  if (projectStore.project.scripts.length <= 1) {
    ElMessage.warning("涓嶈兘鍒犻櫎鏈€鍚庝竴涓剼鏈€?);
    return;
  }
  try {
    await ElMessageBox.confirm("鍒犻櫎鑴氭湰鍚庯紝寮曠敤瀹冪殑璺宠浆浼氱敱鏍￠獙闈㈡澘鎻愮ず銆傜户缁垹闄わ紵", "鍒犻櫎鑴氭湰", {
      confirmButtonText: "鍒犻櫎",
      cancelButtonText: "鍙栨秷",
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

/** 璁剧疆鍏ュ彛鑴氭湰銆?*/
function handleSetStartScript(scriptId: string): void {
  applyProject(setEditorStartScript(projectStore.project, scriptId));
}

/** 鏂板瀵硅瘽鑺傜偣銆?*/
function handleAddDialogue(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addDialogueNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板鏃佺櫧鑺傜偣銆?*/
function handleAddNarration(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addNarrationNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板闀滃ご鑺傜偣銆?*/
function handleAddCamera(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addCameraNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板鏍囩鑺傜偣銆?*/
/** 鏂板鍔ㄤ綔搴忓垪鑺傜偣銆?*/
function handleAddActionSequence(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addActionSequenceNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板浠ｇ爜鍨嬪姩鐢昏妭鐐广€?*/
function handleAddPlayAnimation(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addPlayAnimationNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板鐗╁搧鏄剧ず鑺傜偣銆?*/
function handleAddShowProp(): void {
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = addShowPropNodeAfter(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? script?.nodes.at(-1)?.id ?? null);
}

/** 鏂板鐗╁搧闅愯棌鑺傜偣銆?*/
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

/** 澶嶅埗褰撳墠鑺傜偣銆?*/
function handleDuplicateNode(): void {
  if (!projectStore.selectedNodeId) return;
  const currentNodeId = projectStore.selectedNodeId;
  const nextProject = duplicateNode(projectStore.project, projectStore.selectedScriptId, currentNodeId);
  applyProject(nextProject);
  const script = nextProject.scripts.find((item) => item.id === projectStore.selectedScriptId);
  const currentIndex = script?.nodes.findIndex((node) => node.id === currentNodeId) ?? -1;
  selectNode(script?.nodes[currentIndex + 1]?.id ?? currentNodeId);
}

/** 澶嶅埗褰撳墠鑺傜偣鍒板唴閮ㄥ壀璐存澘銆?*/
function handleCopyNode(): void {
  if (!copyNode(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId)) return;
  clipboardAvailable.value = hasClipboardNode();
  ElMessage.success("鑺傜偣宸插鍒躲€?);
}

/** 鍓垏褰撳墠鑺傜偣銆?*/
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

/** 绮樿创鑺傜偣鍒板綋鍓嶈妭鐐逛箣鍚庛€?*/
function handlePasteNode(): void {
  recordBeforeEdit();
  const result = pasteNodeAfter(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId);
  if (!result.ok) return;
  setProject(result.project);
  selectNode(result.nodeId);
  setDirty(true);
  setValidationResult(validateCurrentProject(result.project));
}

/** 涓婄Щ褰撳墠鑺傜偣銆?*/
function handleMoveNodeUp(): void {
  if (!projectStore.selectedNodeId) return;
  applyProject(moveNodeUp(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
  selectNode(projectStore.selectedNodeId);
}

/** 涓嬬Щ褰撳墠鑺傜偣銆?*/
function handleMoveNodeDown(): void {
  if (!projectStore.selectedNodeId) return;
  applyProject(moveNodeDown(projectStore.project, projectStore.selectedScriptId, projectStore.selectedNodeId));
  selectNode(projectStore.selectedNodeId);
}

/** 鍒犻櫎褰撳墠鑺傜偣銆?*/
function handleDeleteNode(): void {
  if (!projectStore.selectedNodeId) return;
  const deletedNodeId = projectStore.selectedNodeId;
  const nextProject = deleteNode(projectStore.project, projectStore.selectedScriptId, deletedNodeId);
  applyProject(nextProject);
  selectNode(selectSafeNodeAfterDelete(nextProject, projectStore.selectedScriptId, deletedNodeId));
}

/** 鐐瑰嚮瀵煎叆椤圭洰鎸夐挳銆?*/
async function handleImportProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("瀵煎叆椤圭洰"))) return;
  fileInputRef.value?.click();
}

/** 澶勭悊瀵煎叆椤圭洰鏂囦欢銆?*/
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
    ElMessage.success("椤圭洰瀵煎叆鎴愬姛銆?);
  } else {
    ElMessage.warning("椤圭洰宸插鍏ワ紝浣嗗瓨鍦ㄦ牎楠岄棶棰樸€?);
  }
}

/** 瀵煎嚭褰撳墠椤圭洰 JSON銆?*/
async function handleExportProject(): Promise<void> {
  const validation = validateCurrentProject(projectStore.project);
  setValidationResult(validation);

  if (!validation.valid) {
    try {
      await ElMessageBox.confirm("褰撳墠椤圭洰瀛樺湪鏍￠獙闂锛屼粛鐒跺鍑?JSON 鍚楋紵", "瀵煎嚭鎻愰啋", {
        confirmButtonText: "浠嶇劧瀵煎嚭",
        cancelButtonText: "鍙栨秷",
        type: "warning"
      });
    } catch {
      return;
    }
  }

  downloadProjectJson(projectStore.project, createProjectExportFileName(projectStore.project));
  setDirty(false);
  ElMessage.success("椤圭洰 JSON 宸插鍑恒€?);
}

/** 閲嶇疆涓?demo 椤圭洰銆?*/
async function handleResetDemo(): Promise<void> {
  if (!(await confirmDiscardIfDirty("閲嶇疆涓?demo 椤圭洰"))) return;
  loadProjectIntoEditor(loadDemoProject(), false);
  desktopProjectRoot.value = null;
  ElMessage.success("宸查噸缃负 demo 椤圭洰銆?);
}

/** 鍔犺浇 Showcase Demo 椤圭洰銆?*/
async function handleLoadShowcase(): Promise<void> {
  if (!(await confirmDiscardIfDirty("鍔犺浇 Showcase Demo"))) return;
  loadProjectIntoEditor(loadShowcaseProject(), false);
  desktopProjectRoot.value = null;
  setActiveView("script");
  ElMessage.success("宸插姞杞?Showcase Demo銆?);
}

/** 浠庨《閮ㄨ彍鍗曟垨蹇嵎鍏ュ彛閲嶆柊寮€濮嬮瑙堛€?*/
function handleRestartPreview(): void {
  previewPanelRef.value?.restart();
}

/** 鏂板缓妗岄潰鏈湴宸ョ▼銆?*/
async function handleCreateDesktopProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("鏂板缓鏈湴宸ョ▼"))) return;
  const result = await createDesktopProjectDirectory();
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "鏂板缓鏈湴宸ョ▼澶辫触銆?);
    return;
  }
  desktopProjectRoot.value = result.data.rootPath;
  loadProjectIntoEditor(result.data.project, false);
  ElMessage.success("鏈湴宸ョ▼宸叉柊寤恒€?);
}

/** 鎵撳紑妗岄潰鏈湴宸ョ▼銆?*/
async function handleOpenDesktopProject(): Promise<void> {
  if (!(await confirmDiscardIfDirty("鎵撳紑鏈湴宸ョ▼"))) return;
  const result = await openDesktopProjectDirectory();
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "鎵撳紑鏈湴宸ョ▼澶辫触銆?);
    return;
  }
  desktopProjectRoot.value = result.data.rootPath;
  loadProjectIntoEditor(result.data.project, false);
  ElMessage.success("鏈湴宸ョ▼宸叉墦寮€銆?);
}

/** 淇濆瓨褰撳墠椤圭洰鍒版闈㈡湰鍦板伐绋嬬洰褰曘€?*/
async function handleSaveDesktopProject(): Promise<void> {
  const result = await saveDesktopProject(projectStore.project);
  if (!result.ok) {
    ElMessage.error(result.message ?? "淇濆瓨鏈湴宸ョ▼澶辫触銆?);
    return;
  }
  setDirty(false);
  ElMessage.success("鏈湴宸ョ▼宸蹭繚瀛樸€?);
}

/** 瀵煎嚭妗岄潰瀹屾暣 Web 娓告垙鍖呫€?*/
async function handleExportDesktopWebGame(): Promise<void> {
  const result = await exportDesktopWebGame(projectStore.project);
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "瀵煎嚭瀹屾暣 Web 娓告垙鍖呭け璐ャ€?);
    return;
  }
  ElMessage.success(`Web 娓告垙鍖呭凡瀵煎嚭锛?{result.data.export_dir}`);
}

/** 鍦ㄦ闈㈡ā寮忓鍏ョ礌鏉愭枃浠跺苟鐧昏涓虹礌鏉愬厓鏁版嵁銆?*/
async function handleImportAssetFile(assetType: AssetType): Promise<void> {
  const result = await importDesktopAssetFile(assetType);
  if (!result.ok || !result.data) {
    ElMessage.error(result.message ?? "瀵煎叆绱犳潗澶辫触銆?);
    return;
  }
  const fileName = result.data.relative_path.split("/").at(-1) ?? "瀵煎叆绱犳潗";
  const asset = {
    ...createEmptyAsset(assetType),
    name: fileName.replace(/\.[^.]+$/, ""),
    path: result.data.relative_path
  };
  applyProject(addAsset(projectStore.project, asset));
  setWorkspaceSelection({ kind: "asset", id: asset.id });
  setInspectorTab("assets");
  ElMessage.success("绱犳潗宸插鍒跺埌宸ョ▼ assets 骞剁櫥璁般€?);
}

/** 瀹氫綅鏍￠獙闂鍒拌剼鏈拰鑺傜偣銆?*/
function handleLocateValidationIssue(issue: ValidationIssue): void {
  if (issue.scriptId && projectStore.project.scripts.some((script) => script.id === issue.scriptId)) {
    selectScript(issue.scriptId);
    setActiveView("script");
  }
  if (issue.nodeId) selectNode(issue.nodeId);
}

/** 瀹氫綅鑺傜偣鎴栨爣绛捐烦杞洰鏍囥€?*/
function handleLocateTarget(target: NodeTarget): void {
  const nodeId = resolveTargetNodeId(projectStore.project, target);
  if (!nodeId) {
    ElMessage.warning("鐩爣涓嶅瓨鍦紝鏃犳硶瀹氫綅銆?);
    return;
  }
  selectScript(target.scriptId);
  selectNode(nodeId);
  setActiveView("script");
}

/** 鑱氱劍鑺傜偣鎼滅储妗嗐€?*/
function focusNodeSearch(): void {
  document.querySelector<HTMLInputElement>("#node-search-input")?.focus();
}

/** 淇濆瓨蹇嵎閿叆鍙ｃ€?*/
function handleShortcutSave(): void {
  if (desktopMode) {
    void handleSaveDesktopProject();
  } else {
    void handleExportProject();
  }
}

/** 缂栬緫鍣ㄥ揩鎹烽敭鐩戝惉鍣ㄣ€?*/
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
  <EditorWorkbench ref="workbenchRef">
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
      />
    </template>

    <template #center>
      <CenterStage ref="centerStageRef">
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
            <span>璇ュ伐浣滃尯鐨勭紪杈戣〃鍗曚綅浜庝腑澶笅鏂广€傛牎楠屾憳瑕佸凡绉诲姩鍒板簳閮ㄧ姸鎬佹爮銆?/span>
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
