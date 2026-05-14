import type { ValidationIssue, VNProject, ValidationResult } from "./project";
import type { NodeTarget, StoryNode } from "./node";

/** 生成用于查找跳转目标的复合键。 */
function targetKey(target: NodeTarget): string {
  return `${target.scriptId}:${target.nodeId}`;
}

/** 创建校验错误。 */
function createError(message: string, scriptId?: string, nodeId?: string): ValidationIssue {
  return { level: "error", message, scriptId, nodeId };
}

/** 从剧情节点中收集所有跳转目标。 */
function collectTargets(node: StoryNode): NodeTarget[] {
  if (node.type === "jump") return [node.target];
  if (node.type === "choice") return node.options.map((option) => option.target);
  if (node.type === "condition") {
    return [
      ...node.branches.map((branch) => branch.target),
      ...(node.fallbackTarget ? [node.fallbackTarget] : [])
    ];
  }
  return [];
}

/** 校验视觉小说工程的基础结构和引用关系。 */
export function validateProject(project: VNProject): ValidationResult {
  /** 错误问题列表。 */
  const errors: ValidationIssue[] = [];
  /** 警告问题列表。 */
  const warnings: ValidationIssue[] = [];
  /** 已出现的脚本 id 集合。 */
  const scriptIds = new Set<string>();
  /** 已出现的节点 id 集合，第一阶段要求工程内全局唯一。 */
  const nodeIds = new Set<string>();
  /** 可跳转目标集合。 */
  const targets = new Set<string>();

  if (!project.id.trim()) errors.push(createError("项目 id 不能为空。"));

  for (const script of project.scripts) {
    if (scriptIds.has(script.id)) errors.push(createError(`脚本 id 重复：${script.id}`, script.id));
    scriptIds.add(script.id);

    for (const node of script.nodes) {
      if (nodeIds.has(node.id)) errors.push(createError(`节点 id 重复：${node.id}`, script.id, node.id));
      nodeIds.add(node.id);
      targets.add(`${script.id}:${node.id}`);
    }
  }

  if (!scriptIds.has(project.startScriptId)) {
    errors.push(createError(`startScriptId 不存在：${project.startScriptId}`));
  }

  for (const script of project.scripts) {
    for (const node of script.nodes) {
      for (const target of collectTargets(node)) {
        if (!targets.has(targetKey(target))) {
          errors.push(createError(`节点 ${node.id} 的跳转目标不存在：${targetKey(target)}`, script.id, node.id));
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
