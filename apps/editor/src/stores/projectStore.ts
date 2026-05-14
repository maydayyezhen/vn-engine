import { computed, reactive } from "vue";
import type { ScriptFile, StoryNode, VNProject } from "@vn-engine/vn-schema";
import { loadDemoProject } from "../services/projectLoadService";

/** 工程数据 store 状态。 */
export interface ProjectStoreState {
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前选中的脚本 id。 */
  selectedScriptId: string;
  /** 当前选中的节点 id。 */
  selectedNodeId: string | null;
}

/** 初始 demo 工程。 */
const initialProject = loadDemoProject();

/** 全局工程数据 store。 */
export const projectStore = reactive<ProjectStoreState>({
  project: initialProject,
  selectedScriptId: initialProject.startScriptId,
  selectedNodeId: initialProject.scripts[0]?.nodes[0]?.id ?? null
});

/** 当前脚本列表。 */
export const scriptList = computed<ScriptFile[]>(() => projectStore.project.scripts);

/** 当前选中的脚本。 */
export const currentScript = computed<ScriptFile | undefined>(() =>
  projectStore.project.scripts.find((script) => script.id === projectStore.selectedScriptId)
);

/** 当前选中的节点。 */
export const currentNode = computed<StoryNode | null>(() => {
  if (!currentScript.value || !projectStore.selectedNodeId) return null;
  return currentScript.value.nodes.find((node) => node.id === projectStore.selectedNodeId) ?? null;
});

/** 替换当前工程数据。 */
export function setProject(project: VNProject): void {
  projectStore.project = project;
}

/** 选择脚本。 */
export function selectScript(scriptId: string): void {
  projectStore.selectedScriptId = scriptId;
  const script = projectStore.project.scripts.find((item) => item.id === scriptId);
  projectStore.selectedNodeId = script?.nodes[0]?.id ?? null;
}

/** 选择节点。 */
export function selectNode(nodeId: string | null): void {
  projectStore.selectedNodeId = nodeId;
}
