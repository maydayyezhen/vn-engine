import type { StoryNode, VNProject } from "@vn-engine/vn-schema";
import { getNodeSummary } from "./scriptEditService";

/** 节点筛选类型。 */
export type NodeFilterType = "all" | "dialogue" | "narration" | "choice" | "scene" | "camera" | "actionSequence" | "playAnimation" | "label" | "character" | "prop" | "audio" | "variable" | "condition" | "jump";

/** 节点搜索筛选参数。 */
export interface NodeSearchOptions {
  /** 搜索关键字。 */
  query: string;
  /** 节点类型筛选。 */
  type: NodeFilterType;
}

/** 搜索结果项。 */
export interface NodeSearchResult {
  /** 脚本 id。 */
  scriptId: string;
  /** 节点。 */
  node: StoryNode;
}

/** 判断节点是否匹配类型筛选。 */
export function matchNodeType(node: StoryNode, type: NodeFilterType): boolean {
  if (type === "all") return true;
  if (type === "character") return node.type === "showCharacter" || node.type === "hideCharacter";
  if (type === "prop") return node.type === "showProp" || node.type === "hideProp";
  if (type === "audio") return node.type === "playAudio" || node.type === "stopAudio";
  if (type === "variable") return node.type === "setVariable";
  return node.type === type;
}

/** 获取节点搜索文本。 */
export function getNodeSearchText(project: VNProject, node: StoryNode): string {
  const summary = getNodeSummary(node);
  const parts = [node.id, node.type, summary];
  if (node.type === "dialogue") {
    const character = project.characters.find((item) => item.id === node.characterId);
    parts.push(node.characterId, character?.name ?? "", character?.displayName ?? "");
  }
  if (node.type === "choice") {
    parts.push(...node.options.flatMap((option) => [option.id, option.text, option.target.scriptId, option.target.nodeId ?? "", option.target.label ?? ""]));
  }
  if (node.type === "label") parts.push(node.name, node.description ?? "");
  if (node.type === "actionSequence") parts.push(node.name ?? "", ...node.actions.map((action) => `${action.id} ${action.type}`));
  if (node.type === "playAnimation") parts.push(node.animationId, ...Object.values(node.targets ?? {}).map((target) => `${target.type} ${target.id ?? ""}`));
  if (node.type === "showProp") parts.push(node.propId, node.assetId, node.name ?? "");
  if (node.type === "hideProp") parts.push(node.propId, node.exitAnimationId ?? "");
  return parts.join(" ").toLowerCase();
}

/** 判断节点是否匹配搜索关键字。 */
export function matchNodeSearch(project: VNProject, node: StoryNode, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return getNodeSearchText(project, node).includes(normalized);
}

/** 筛选当前脚本节点。 */
export function filterNodes(project: VNProject, nodes: StoryNode[], options: NodeSearchOptions): StoryNode[] {
  return nodes.filter((node) => matchNodeType(node, options.type) && matchNodeSearch(project, node, options.query));
}

/** 搜索全项目节点。 */
export function searchProjectNodes(project: VNProject, options: NodeSearchOptions): NodeSearchResult[] {
  return project.scripts.flatMap((script) =>
    filterNodes(project, script.nodes, options).map((node) => ({
      scriptId: script.id,
      node
    }))
  );
}
