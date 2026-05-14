import type { NodeTarget, StoryNode, VNProject } from "@vn-engine/vn-schema";

/** 目标选择模式。 */
export type TargetMode = "node" | "label";

/** 获取目标模式。 */
export function getTargetMode(target: NodeTarget | undefined): TargetMode {
  return target?.label ? "label" : "node";
}

/** 获取脚本中的标签节点。 */
export function getLabelNodes(project: VNProject, scriptId: string): Extract<StoryNode, { type: "label" }>[] {
  return (project.scripts.find((script) => script.id === scriptId)?.nodes ?? []).filter((node): node is Extract<StoryNode, { type: "label" }> => node.type === "label");
}

/** 创建节点目标。 */
export function createNodeTarget(scriptId: string, nodeId: string): NodeTarget {
  return { scriptId, nodeId };
}

/** 创建标签目标。 */
export function createLabelTarget(scriptId: string, label: string): NodeTarget {
  return { scriptId, label };
}

/** 定位目标对应的节点 id。 */
export function resolveTargetNodeId(project: VNProject, target: NodeTarget | undefined): string | null {
  if (!target) return null;
  const script = project.scripts.find((item) => item.id === target.scriptId);
  if (!script) return null;
  if (target.nodeId) return script.nodes.some((node) => node.id === target.nodeId) ? target.nodeId : null;
  if (target.label) return script.nodes.find((node) => node.type === "label" && node.name === target.label)?.id ?? null;
  return null;
}

/** 获取目标摘要。 */
export function getTargetSummary(target: NodeTarget | undefined): string {
  if (!target) return "未设置目标";
  return target.label ? `${target.scriptId}#${target.label}` : `${target.scriptId}:${target.nodeId ?? "未设置节点"}`;
}
