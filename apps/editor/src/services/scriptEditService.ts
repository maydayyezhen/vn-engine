import type { ScriptFile, StoryNode } from "@vn-engine/vn-schema";

/** 获取脚本中的节点列表。 */
export function listStoryNodes(script: ScriptFile | undefined): StoryNode[] {
  return script?.nodes ?? [];
}

/** 根据节点 id 查找节点。 */
export function findStoryNode(script: ScriptFile | undefined, nodeId: string | null): StoryNode | null {
  if (!script || !nodeId) return null;
  return script.nodes.find((node) => node.id === nodeId) ?? null;
}
