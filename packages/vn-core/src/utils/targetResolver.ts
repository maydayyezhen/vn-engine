import type { NodeTarget, VNProject } from "@vn-engine/vn-schema";
import { findNodeIndex, findScript } from "./runtimeLookup";

/** 已解析的运行时跳转目标。 */
export interface ResolvedRuntimeTarget {
  /** 目标脚本 id。 */
  scriptId: string;
  /** 目标节点 id。 */
  nodeId: string;
  /** 目标节点下标。 */
  nodeIndex: number;
}

/** 解析节点或标签跳转目标。 */
export function resolveRuntimeTarget(project: VNProject, target: NodeTarget): ResolvedRuntimeTarget | undefined {
  const script = findScript(project, target.scriptId);
  if (!script) return undefined;

  if (target.label) {
    const nodeIndex = script.nodes.findIndex((node) => node.type === "label" && node.name === target.label);
    const node = script.nodes[nodeIndex];
    if (nodeIndex < 0 || !node) return undefined;
    return {
      scriptId: script.id,
      nodeId: node.id,
      nodeIndex
    };
  }

  if (!target.nodeId) return undefined;
  const nodeIndex = findNodeIndex(script, target.nodeId);
  if (nodeIndex < 0) return undefined;
  return {
    scriptId: script.id,
    nodeId: target.nodeId,
    nodeIndex
  };
}
