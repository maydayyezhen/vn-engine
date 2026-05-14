import type { ScriptFile, StoryNode, VNProject } from "@vn-engine/vn-schema";

/** 根据脚本 id 查找脚本文件。 */
export function findScript(project: VNProject, scriptId: string): ScriptFile | undefined {
  return project.scripts.find((script) => script.id === scriptId);
}

/** 根据脚本和节点 id 查找节点下标。 */
export function findNodeIndex(script: ScriptFile, nodeId: string): number {
  return script.nodes.findIndex((node) => node.id === nodeId);
}

/** 根据脚本和节点下标查找剧情节点。 */
export function findNodeByIndex(script: ScriptFile, index: number): StoryNode | undefined {
  return script.nodes[index];
}
