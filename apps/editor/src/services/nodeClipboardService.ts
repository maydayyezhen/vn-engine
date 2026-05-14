import type { StoryNode, VNProject } from "@vn-engine/vn-schema";
import { deleteNode, insertNodeAfter, selectSafeNodeAfterDelete } from "./scriptEditService";

/** 编辑器内部节点剪贴板。 */
interface NodeClipboardState {
  /** 剪贴板节点数据。 */
  node: StoryNode | null;
  /** 是否来自剪切操作。 */
  cut: boolean;
}

/** 模块级剪贴板状态，不使用系统剪贴板。 */
const clipboard: NodeClipboardState = {
  node: null,
  cut: false
};

/** 深拷贝 JSON 兼容对象。 */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 生成粘贴后的新节点 id。 */
function createPastedNodeId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 查找节点。 */
function findNode(project: VNProject, scriptId: string, nodeId: string | null): StoryNode | null {
  if (!nodeId) return null;
  return project.scripts.find((script) => script.id === scriptId)?.nodes.find((node) => node.id === nodeId) ?? null;
}

/** 复制节点到编辑器内部剪贴板。 */
export function copyNode(project: VNProject, scriptId: string, nodeId: string | null): boolean {
  const node = findNode(project, scriptId, nodeId);
  if (!node) return false;
  clipboard.node = cloneJson(node);
  clipboard.cut = false;
  return true;
}

/** 剪切节点到编辑器内部剪贴板，并返回删除后的项目。 */
export function cutNode(project: VNProject, scriptId: string, nodeId: string | null): { project: VNProject; selectedNodeId: string | null; ok: boolean } {
  const node = findNode(project, scriptId, nodeId);
  if (!node || !nodeId) return { project, selectedNodeId: nodeId, ok: false };
  clipboard.node = cloneJson(node);
  clipboard.cut = true;
  const nextProject = deleteNode(project, scriptId, nodeId);
  return {
    project: nextProject,
    selectedNodeId: selectSafeNodeAfterDelete(nextProject, scriptId, nodeId),
    ok: true
  };
}

/** 粘贴剪贴板节点到指定节点后方。 */
export function pasteNodeAfter(project: VNProject, targetScriptId: string, afterNodeId: string | null): { project: VNProject; nodeId: string | null; ok: boolean } {
  if (!clipboard.node) return { project, nodeId: null, ok: false };
  const node = {
    ...cloneJson(clipboard.node),
    id: createPastedNodeId(clipboard.node.type)
  } as StoryNode;
  return {
    project: insertNodeAfter(project, targetScriptId, afterNodeId, node),
    nodeId: node.id,
    ok: true
  };
}

/** 清空编辑器内部剪贴板。 */
export function clearClipboard(): void {
  clipboard.node = null;
  clipboard.cut = false;
}

/** 判断剪贴板中是否存在节点。 */
export function hasClipboardNode(): boolean {
  return !!clipboard.node;
}
