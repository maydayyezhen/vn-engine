import type { AssetItem, AssetType } from "./asset";
import type { NodeTarget, StoryNode } from "./node";
import type { ValidationIssue, ValidationResult, VNProject } from "./project";

/** 合法背景转场类型集合。 */
const TRANSITION_TYPES = ["none", "fade", "slideLeft", "slideRight"] as const;
/** 合法角色登场效果集合。 */
const ENTER_EFFECTS = ["none", "fadeIn", "slideInLeft", "slideInRight"] as const;
/** 合法角色退场效果集合。 */
const EXIT_EFFECTS = ["none", "fadeOut", "slideOutLeft", "slideOutRight"] as const;
/** 合法角色位置集合。 */
const CHARACTER_POSITIONS = ["left", "center", "right", "custom"] as const;

/** 生成用于查找跳转目标的复合键。 */
function targetKey(target: NodeTarget): string {
  return `${target.scriptId}:${target.nodeId}`;
}

/** 创建校验错误。 */
function createError(message: string, scriptId?: string, nodeId?: string): ValidationIssue {
  return { level: "error", message, scriptId, nodeId };
}

/** 创建校验警告。 */
function createWarning(message: string, scriptId?: string, nodeId?: string): ValidationIssue {
  return { level: "warning", message, scriptId, nodeId };
}

/** 判断字符串是否属于白名单。 */
function isOneOf(value: unknown, values: readonly string[]): boolean {
  return typeof value === "string" && values.includes(value);
}

/** 校验毫秒时长范围。 */
function validateDuration(value: number | undefined, fieldName: string, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0 || value > 5000) {
    errors.push(createError(`${fieldName} 必须在 0 到 5000 毫秒之间。`, scriptId, nodeId));
  }
}

/** 校验演出字段。 */
function validatePresentationNode(node: StoryNode, scriptId: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  if (node.type === "scene") {
    if (node.transition !== undefined && !isOneOf(node.transition, TRANSITION_TYPES)) {
      errors.push(createError(`背景转场类型非法：${String(node.transition)}`, scriptId, node.id));
    }
    validateDuration(node.transitionDurationMs, "背景转场时长", errors, scriptId, node.id);
  }

  if (node.type === "showCharacter") {
    if (node.position !== undefined && !isOneOf(node.position, CHARACTER_POSITIONS)) {
      errors.push(createError(`角色位置类型非法：${String(node.position)}`, scriptId, node.id));
    }
    if (node.enterEffect !== undefined && !isOneOf(node.enterEffect, ENTER_EFFECTS)) {
      errors.push(createError(`角色登场效果非法：${String(node.enterEffect)}`, scriptId, node.id));
    }
    validateDuration(node.transitionDurationMs, "角色登场时长", errors, scriptId, node.id);
    if (node.scale !== undefined && (!Number.isFinite(node.scale) || node.scale <= 0)) {
      errors.push(createError("角色缩放必须大于 0。", scriptId, node.id));
    }
    if (node.opacity !== undefined && (!Number.isFinite(node.opacity) || node.opacity < 0 || node.opacity > 1)) {
      errors.push(createError("角色透明度必须在 0 到 1 之间。", scriptId, node.id));
    }
    if (node.position === "custom" && (node.x === undefined || node.y === undefined)) {
      warnings.push(createWarning("自定义角色位置建议同时填写 x 和 y。", scriptId, node.id));
    }
  }

  if (node.type === "hideCharacter") {
    if (node.exitEffect !== undefined && !isOneOf(node.exitEffect, EXIT_EFFECTS)) {
      errors.push(createError(`角色退场效果非法：${String(node.exitEffect)}`, scriptId, node.id));
    }
    validateDuration(node.transitionDurationMs, "角色退场时长", errors, scriptId, node.id);
  }

  if (node.type === "camera") {
    validateDuration(node.durationMs, "镜头效果时长", errors, scriptId, node.id);
    if (node.zoom !== undefined && (!Number.isFinite(node.zoom) || node.zoom <= 0 || node.zoom > 5)) {
      errors.push(createError("镜头缩放必须大于 0 且不超过 5。", scriptId, node.id));
    }
    if (node.shakeIntensity !== undefined && (!Number.isFinite(node.shakeIntensity) || node.shakeIntensity < 0 || node.shakeIntensity > 100)) {
      warnings.push(createWarning("镜头震动强度建议保持在 0 到 100 之间。", scriptId, node.id));
    }
  }
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

/** 判断素材是否属于音频类型。 */
function isAudioAsset(asset: AssetItem | undefined): boolean {
  return !!asset && ["bgm", "sound", "sfx", "voice"].includes(asset.type);
}

/** 查找素材。 */
function findAsset(project: VNProject, assetId: string | undefined): AssetItem | undefined {
  if (!assetId) return undefined;
  return project.assets.items.find((asset) => asset.id === assetId);
}

/** 判断素材类型。 */
function hasAssetOfType(project: VNProject, assetId: string, type: AssetType): boolean {
  return findAsset(project, assetId)?.type === type;
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
  /** 已出现的素材 id 集合。 */
  const assetIds = new Set<string>();
  /** 已出现的角色 id 集合。 */
  const characterIds = new Set<string>();

  if (!project.id.trim()) errors.push(createError("项目 id 不能为空。"));

  for (const asset of project.assets.items) {
    if (assetIds.has(asset.id)) errors.push(createError(`素材 id 重复：${asset.id}`));
    assetIds.add(asset.id);
  }

  for (const character of project.characters) {
    if (characterIds.has(character.id)) errors.push(createError(`角色 id 重复：${character.id}`));
    characterIds.add(character.id);

    const expressionIds = new Set<string>();
    for (const expression of character.expressions ?? []) {
      if (expressionIds.has(expression.id)) errors.push(createError(`角色 ${character.id} 的表情 id 重复：${expression.id}`));
      expressionIds.add(expression.id);
      if (!findAsset(project, expression.assetId)) {
        errors.push(createError(`角色 ${character.id} 的表情 ${expression.id} 引用的素材不存在：${expression.assetId}`));
      }
    }
  }

  for (const script of project.scripts) {
    if (scriptIds.has(script.id)) errors.push(createError(`脚本 id 重复：${script.id}`, script.id));
    scriptIds.add(script.id);

    for (const node of script.nodes) {
      if (nodeIds.has(node.id)) errors.push(createError(`节点 id 重复：${node.id}`, script.id, node.id));
      nodeIds.add(node.id);
      targets.add(`${script.id}:${node.id}`);
      validatePresentationNode(node, script.id, errors, warnings);
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

      if (node.type === "scene" && !hasAssetOfType(project, node.backgroundAssetId, "background")) {
        errors.push(createError(`场景节点引用的背景素材不存在或类型不正确：${node.backgroundAssetId}`, script.id, node.id));
      }

      if (node.type === "showCharacter") {
        const character = project.characters.find((item) => item.id === node.characterId);
        if (!character) {
          errors.push(createError(`角色登场节点引用的角色不存在：${node.characterId}`, script.id, node.id));
        } else if (node.expression && !(character.expressions ?? []).some((expression) => expression.id === node.expression)) {
          errors.push(createError(`角色 ${node.characterId} 不存在表情：${node.expression}`, script.id, node.id));
        }
      }

      if (node.type === "playAudio" && !isAudioAsset(findAsset(project, node.assetId))) {
        errors.push(createError(`音频节点引用的音频素材不存在或类型不正确：${node.assetId}`, script.id, node.id));
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
