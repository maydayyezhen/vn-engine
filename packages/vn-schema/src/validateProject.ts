import type { AssetItem, AssetType } from "./asset";
import type {
  ConditionExpression,
  NodeTarget,
  StoryNode,
  VariableValue,
  VNAction,
  VNVariableDefinition
} from "./node";
import type { ValidationIssue, ValidationResult, VNProject } from "./project";

/** 合法背景转场类型集合。 */
const TRANSITION_TYPES = ["none", "fade", "slideLeft", "slideRight"] as const;
/** 合法角色登场效果集合。 */
const ENTER_EFFECTS = ["none", "fadeIn", "slideInLeft", "slideInRight"] as const;
/** 合法角色退场效果集合。 */
const EXIT_EFFECTS = ["none", "fadeOut", "slideOutLeft", "slideOutRight"] as const;
/** 合法角色位置集合。 */
const CHARACTER_POSITIONS = ["left", "center", "right", "custom"] as const;
/** 合法结构化条件比较运算符集合。 */
const CONDITION_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte", "contains", "notContains"] as const;
/** 合法旧版条件比较运算符集合。 */
const LEGACY_CONDITION_OPERATORS = ["equals", "notEquals", "greaterThan", "lessThan", "exists"] as const;
/** 合法变量赋值运算符集合。 */
const ASSIGN_OPERATORS = ["set", "add", "subtract"] as const;
/** 鍚堟硶鍔ㄤ綔绫诲瀷闆嗗悎銆?*/
const ACTION_TYPES = ["wait", "scene", "showCharacter", "hideCharacter", "moveCharacter", "changeExpression", "camera", "playAudio", "stopAudio", "parallel"] as const;
/** 鍚堟硶鍔ㄤ綔缂撳姩绫诲瀷闆嗗悎銆?*/
const ACTION_EASINGS = ["linear", "easeIn", "easeOut", "easeInOut"] as const;
/** 鍚堟硶闊抽閫氶亾闆嗗悎銆?*/
const AUDIO_CHANNELS = ["bgm", "sound", "voice", "sfx"] as const;
/** 变量名格式。 */
const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** 创建校验错误。 */
function createError(message: string, scriptId?: string, nodeId?: string): ValidationIssue {
  return { level: "error", message, scriptId, nodeId };
}

/** 创建校验警告。 */
function createWarning(message: string, scriptId?: string, nodeId?: string): ValidationIssue {
  return { level: "warning", message, scriptId, nodeId };
}

/** 鍒涘缓鍙畾浣嶅埌鍔ㄤ綔鐨勬牎楠岄棶棰樸€?*/
function createActionIssue(level: ValidationIssue["level"], message: string, scriptId: string, nodeId: string, actionId: string): ValidationIssue {
  return { level, message, scriptId, nodeId, actionId };
}

/** 判断字符串是否属于白名单。 */
function isOneOf(value: unknown, values: readonly string[]): boolean {
  return typeof value === "string" && values.includes(value);
}

/** 获取变量值的项目级类型。 */
function getValueType(value: unknown): "boolean" | "number" | "string" | "unknown" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "unknown";
}

/** 获取赋值节点的兼容变量名。 */
function getSetVariableName(node: Extract<StoryNode, { type: "setVariable" }>): string {
  return node.variableName ?? node.name ?? "";
}

/** 生成用于查找节点跳转目标的复合键。 */
function nodeTargetKey(scriptId: string, nodeId: string): string {
  return `${scriptId}:${nodeId}`;
}

/** 生成用于查找标签跳转目标的复合键。 */
function labelTargetKey(scriptId: string, label: string): string {
  return `${scriptId}:#${label}`;
}

/** 校验毫秒时长范围。 */
function validateDuration(value: number | undefined, fieldName: string, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0 || value > 5000) {
    errors.push(createError(`${fieldName} 必须在 0 到 5000 毫秒之间。`, scriptId, nodeId));
  }
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

/** 判断素材是否属于音频类型。 */
function isAudioAsset(asset: AssetItem | undefined): boolean {
  return !!asset && ["bgm", "sound", "sfx", "voice"].includes(asset.type);
}

/** 校验变量定义列表。 */
function validateVariables(project: VNProject, errors: ValidationIssue[]): Map<string, VNVariableDefinition> {
  const definitions = new Map<string, VNVariableDefinition>();
  for (const variable of project.variables ?? []) {
    if (definitions.has(variable.name)) errors.push(createError(`变量名重复：${variable.name}`));
    if (!VARIABLE_NAME_PATTERN.test(variable.name)) errors.push(createError(`变量名非法：${variable.name}`));
    if (getValueType(variable.defaultValue) !== variable.type) {
      errors.push(createError(`变量 ${variable.name} 的默认值类型必须是 ${variable.type}。`));
    }
    definitions.set(variable.name, variable);
  }
  return definitions;
}

/** 校验基础演出字段。 */
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

/** 收集节点中的跳转目标。 */
/** 鏍￠獙鍔ㄤ綔 duration 鑼冨洿銆?*/
function validateActionDuration(action: VNAction, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  const duration = action.durationMs ?? (action.type === "wait" ? 500 : 300);
  if (!Number.isFinite(duration) || duration < 0 || duration > 10000) {
    errors.push(createActionIssue("error", `动作 ${action.id} 的 durationMs 必须在 0 到 10000 毫秒之间。`, scriptId, nodeId, action.id));
  }
}

/** 鏍￠獙鍔ㄤ綔涓殑瑙掕壊琛ㄦ儏寮曠敤銆?*/
function validateActionExpression(project: VNProject, characterId: string, expressionId: string | undefined, action: VNAction, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  const character = project.characters.find((item) => item.id === characterId);
  if (!character) {
    errors.push(createActionIssue("error", `动作 ${action.id} 引用的角色不存在：${characterId}`, scriptId, nodeId, action.id));
    return;
  }
  if (expressionId && !(character.expressions ?? []).some((expression) => expression.id === expressionId)) {
    errors.push(createActionIssue("error", `动作 ${action.id} 引用的表情不存在：${characterId}.${expressionId}`, scriptId, nodeId, action.id));
  }
}

/** 鏍￠獙鍔ㄤ綔浣嶇疆鍜屾樉绀哄弬鏁般€?*/
function validateActionDisplayFields(action: VNAction, errors: ValidationIssue[], warnings: ValidationIssue[], scriptId: string, nodeId: string): void {
  if ("position" in action && action.position !== undefined && !isOneOf(action.position, CHARACTER_POSITIONS)) {
    errors.push(createActionIssue("error", `动作 ${action.id} 的角色位置非法：${String(action.position)}`, scriptId, nodeId, action.id));
  }
  if ("position" in action && action.position === "custom" && (action.x === undefined || action.y === undefined)) {
    warnings.push(createActionIssue("warning", `动作 ${action.id} 使用 custom 位置时建议同时填写 x 和 y。`, scriptId, nodeId, action.id));
  }
  if ("scale" in action && action.scale !== undefined && (!Number.isFinite(action.scale) || action.scale <= 0)) {
    errors.push(createActionIssue("error", `动作 ${action.id} 的 scale 必须大于 0。`, scriptId, nodeId, action.id));
  }
  if ("opacity" in action && action.opacity !== undefined && (!Number.isFinite(action.opacity) || action.opacity < 0 || action.opacity > 1)) {
    errors.push(createActionIssue("error", `动作 ${action.id} 的 opacity 必须在 0 到 1 之间。`, scriptId, nodeId, action.id));
  }
}

/** 鏍￠獙鍔ㄤ綔搴忓垪涓殑鍗曚釜鍔ㄤ綔銆?*/
function validateAction(project: VNProject, action: VNAction, actionIds: Set<string>, errors: ValidationIssue[], warnings: ValidationIssue[], scriptId: string, nodeId: string, depth = 0): void {
  if (actionIds.has(action.id)) errors.push(createActionIssue("error", `动作 id 重复：${action.id}`, scriptId, nodeId, action.id));
  actionIds.add(action.id);
  if (!isOneOf(action.type, ACTION_TYPES)) {
    errors.push(createActionIssue("error", `动作类型非法：${String(action.type)}`, scriptId, nodeId, action.id));
    return;
  }
  if (action.easing !== undefined && !isOneOf(action.easing, ACTION_EASINGS)) {
    errors.push(createActionIssue("error", `动作 ${action.id} 的 easing 非法：${String(action.easing)}`, scriptId, nodeId, action.id));
  }
  validateActionDuration(action, errors, scriptId, nodeId);
  validateActionDisplayFields(action, errors, warnings, scriptId, nodeId);

  if (action.type === "scene" && !hasAssetOfType(project, action.backgroundAssetId, "background")) {
    errors.push(createActionIssue("error", `scene 动作引用的背景素材不存在或类型不正确：${action.backgroundAssetId}`, scriptId, nodeId, action.id));
  }
  if (action.type === "showCharacter") {
    validateActionExpression(project, action.characterId, action.expression, action, errors, scriptId, nodeId);
    if (action.enterEffect !== undefined && !isOneOf(action.enterEffect, ENTER_EFFECTS)) {
      errors.push(createActionIssue("error", `showCharacter 动作入场效果非法：${String(action.enterEffect)}`, scriptId, nodeId, action.id));
    }
  }
  if (action.type === "hideCharacter") {
    validateActionExpression(project, action.characterId, undefined, action, errors, scriptId, nodeId);
    if (action.exitEffect !== undefined && !isOneOf(action.exitEffect, EXIT_EFFECTS)) {
      errors.push(createActionIssue("error", `hideCharacter 动作退场效果非法：${String(action.exitEffect)}`, scriptId, nodeId, action.id));
    }
  }
  if (action.type === "moveCharacter") validateActionExpression(project, action.characterId, undefined, action, errors, scriptId, nodeId);
  if (action.type === "changeExpression") validateActionExpression(project, action.characterId, action.expression, action, errors, scriptId, nodeId);
  if (action.type === "camera" && action.zoom !== undefined && (!Number.isFinite(action.zoom) || action.zoom <= 0 || action.zoom > 5)) {
    errors.push(createActionIssue("error", "camera 动作 zoom 必须大于 0 且不超过 5。", scriptId, nodeId, action.id));
  }
  if (action.type === "camera" && action.shakeIntensity !== undefined && (!Number.isFinite(action.shakeIntensity) || action.shakeIntensity < 0 || action.shakeIntensity > 100)) {
    warnings.push(createActionIssue("warning", "camera 动作 shakeIntensity 建议保持在 0 到 100 之间。", scriptId, nodeId, action.id));
  }
  if (action.type === "playAudio") {
    if (!isOneOf(action.channel, AUDIO_CHANNELS)) errors.push(createActionIssue("error", `playAudio 动作通道非法：${String(action.channel)}`, scriptId, nodeId, action.id));
    if (!isAudioAsset(findAsset(project, action.assetId))) errors.push(createActionIssue("error", `playAudio 动作引用的音频素材不存在或类型不正确：${action.assetId}`, scriptId, nodeId, action.id));
  }
  if (action.type === "stopAudio" && action.channel !== undefined && !isOneOf(action.channel, AUDIO_CHANNELS)) {
    errors.push(createActionIssue("error", `stopAudio 动作通道非法：${String(action.channel)}`, scriptId, nodeId, action.id));
  }
  if (action.type === "parallel") {
    if (!Array.isArray(action.actions) || action.actions.length === 0) errors.push(createActionIssue("error", "parallel 动作不能为空。", scriptId, nodeId, action.id));
    if (depth > 0) errors.push(createActionIssue("error", "MVP 暂不支持 nested parallel 动作。", scriptId, nodeId, action.id));
    if (depth >= 1) warnings.push(createActionIssue("warning", "parallel 仅用于旧项目兼容，不作为动作序列 MVP 核心能力。", scriptId, nodeId, action.id));
    for (const child of action.actions ?? []) validateAction(project, child, actionIds, errors, warnings, scriptId, nodeId, depth + 1);
  }
}

/** 鏍￠獙鍔ㄤ綔搴忓垪鑺傜偣銆?*/
function validateActionSequenceNode(project: VNProject, node: Extract<StoryNode, { type: "actionSequence" }>, errors: ValidationIssue[], warnings: ValidationIssue[], scriptId: string): void {
  if (!Array.isArray(node.actions) || node.actions.length === 0) {
    warnings.push(createWarning("ActionSequenceNode 当前没有动作。", scriptId, node.id));
    return;
  }
  const actionIds = new Set<string>();
  for (const action of node.actions) validateAction(project, action, actionIds, errors, warnings, scriptId, node.id);
}

function collectTargets(node: StoryNode): NodeTarget[] {
  if (node.type === "jump") return [node.target];
  if (node.type === "choice") return node.options.map((option) => option.target);
  if (node.type === "condition") {
    return [
      ...(node.branches ?? []).map((branch) => branch.target),
      ...(node.fallbackTarget ? [node.fallbackTarget] : []),
      ...(node.trueTarget ? [node.trueTarget] : []),
      ...(node.falseTarget ? [node.falseTarget] : [])
    ];
  }
  return [];
}

/** 校验跳转目标。 */
function validateTarget(target: NodeTarget, errors: ValidationIssue[], nodeTargets: Set<string>, labelTargets: Set<string>, scriptIds: Set<string>, scriptId: string, nodeId: string): void {
  if (!scriptIds.has(target.scriptId)) {
    errors.push(createError(`跳转目标脚本不存在：${target.scriptId}`, scriptId, nodeId));
    return;
  }
  if (target.label) {
    if (!labelTargets.has(labelTargetKey(target.scriptId, target.label))) {
      errors.push(createError(`跳转目标标签不存在：${target.scriptId}#${target.label}`, scriptId, nodeId));
    }
    return;
  }
  if (!target.nodeId) {
    errors.push(createError(`跳转目标缺少 nodeId 或 label：${target.scriptId}`, scriptId, nodeId));
    return;
  }
  if (!nodeTargets.has(nodeTargetKey(target.scriptId, target.nodeId))) {
    errors.push(createError(`跳转目标节点不存在：${target.scriptId}:${target.nodeId}`, scriptId, nodeId));
  }
}

/** 校验结构化条件表达式。 */
function validateConditionExpression(expression: ConditionExpression | undefined, variables: Map<string, VNVariableDefinition>, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  if (!expression || typeof expression !== "object") {
    errors.push(createError("ConditionNode 缺少合法的 condition 表达式。", scriptId, nodeId));
    return;
  }

  if (expression.kind === "variable") {
    const variable = variables.get(expression.variableName);
    if (!variable) {
      errors.push(createError(`条件引用未定义变量：${expression.variableName}`, scriptId, nodeId));
      return;
    }
    if (!isOneOf(expression.operator, CONDITION_OPERATORS)) {
      errors.push(createError(`条件运算符非法：${String(expression.operator)}`, scriptId, nodeId));
      return;
    }
    if (getValueType(expression.value) !== variable.type) {
      errors.push(createError(`条件 ${expression.variableName} 的比较值类型必须是 ${variable.type}。`, scriptId, nodeId));
    }
    if (["contains", "notContains"].includes(expression.operator) && variable.type !== "string") {
      errors.push(createError("contains/notContains 只能用于 string 变量。", scriptId, nodeId));
    }
    return;
  }

  if (expression.kind === "and" || expression.kind === "or") {
    if (!Array.isArray(expression.conditions) || expression.conditions.length === 0) {
      errors.push(createError(`${expression.kind} 条件至少需要一个子条件。`, scriptId, nodeId));
      return;
    }
    for (const child of expression.conditions) validateConditionExpression(child, variables, errors, scriptId, nodeId);
    return;
  }

  if (expression.kind === "not") {
    validateConditionExpression(expression.condition, variables, errors, scriptId, nodeId);
    return;
  }

  errors.push(createError("ConditionExpression 结构非法。", scriptId, nodeId));
}

/** 校验旧版条件分支。 */
function validateLegacyBranch(branch: NonNullable<Extract<StoryNode, { type: "condition" }>["branches"]>[number], variables: Map<string, VNVariableDefinition>, errors: ValidationIssue[], scriptId: string, nodeId: string): void {
  const variable = variables.get(branch.variable);
  if (!variable) {
    errors.push(createError(`条件引用未定义变量：${branch.variable}`, scriptId, nodeId));
    return;
  }
  if (!isOneOf(branch.operator, LEGACY_CONDITION_OPERATORS)) {
    errors.push(createError(`旧版条件运算符非法：${String(branch.operator)}`, scriptId, nodeId));
    return;
  }
  if (branch.operator !== "exists" && branch.value !== undefined && branch.value !== null && getValueType(branch.value) !== variable.type) {
    errors.push(createError(`条件 ${branch.variable} 的比较值类型必须是 ${variable.type}。`, scriptId, nodeId));
  }
}

/** 校验变量写入节点。 */
function validateSetVariableNode(node: Extract<StoryNode, { type: "setVariable" }>, variables: Map<string, VNVariableDefinition>, errors: ValidationIssue[], scriptId: string): void {
  const variableName = getSetVariableName(node);
  const definition = variables.get(variableName);
  const operator = node.operator ?? "set";
  if (!definition) {
    errors.push(createError(`变量赋值引用未定义变量：${variableName || "(空)"}`, scriptId, node.id));
    return;
  }
  if (!isOneOf(operator, ASSIGN_OPERATORS)) {
    errors.push(createError(`变量赋值运算符非法：${String(operator)}`, scriptId, node.id));
  }
  if ((operator === "add" || operator === "subtract") && definition.type !== "number") {
    errors.push(createError("add/subtract 只能用于 number 变量。", scriptId, node.id));
  }
  if (operator === "set" && node.value !== null && getValueType(node.value) !== definition.type) {
    errors.push(createError(`变量 ${variableName} 的赋值类型必须是 ${definition.type}。`, scriptId, node.id));
  }
  if ((operator === "add" || operator === "subtract") && typeof node.value !== "number") {
    errors.push(createError("add/subtract 的 value 必须是 number。", scriptId, node.id));
  }
}

/** 校验视觉小说工程的基础结构、引用关系和剧情逻辑。 */
export function validateProject(project: VNProject): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const scriptIds = new Set<string>();
  const nodeIds = new Set<string>();
  const nodeTargets = new Set<string>();
  const labelTargets = new Set<string>();
  const assetIds = new Set<string>();
  const characterIds = new Set<string>();
  const variables = validateVariables(project, errors);

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
  }

  for (const script of project.scripts) {
    const scriptLabels = new Set<string>();
    for (const node of script.nodes) {
      if (nodeIds.has(node.id)) errors.push(createError(`节点 id 重复：${node.id}`, script.id, node.id));
      nodeIds.add(node.id);
      nodeTargets.add(nodeTargetKey(script.id, node.id));
      if (node.type === "label") {
        if (scriptLabels.has(node.name)) errors.push(createError(`脚本内标签名重复：${node.name}`, script.id, node.id));
        scriptLabels.add(node.name);
        labelTargets.add(labelTargetKey(script.id, node.name));
      }
      validatePresentationNode(node, script.id, errors, warnings);
    }
  }

  if (!scriptIds.has(project.startScriptId)) {
    errors.push(createError(`startScriptId 不存在：${project.startScriptId}`));
  }

  for (const script of project.scripts) {
    for (const node of script.nodes) {
      for (const target of collectTargets(node)) {
        validateTarget(target, errors, nodeTargets, labelTargets, scriptIds, script.id, node.id);
      }

      if (node.type === "setVariable") validateSetVariableNode(node, variables, errors, script.id);
      if (node.type === "actionSequence") validateActionSequenceNode(project, node, errors, warnings, script.id);

      if (node.type === "choice") {
        for (const option of node.options) {
          for (const [name, value] of Object.entries(option.setVariables ?? {})) {
            const definition = variables.get(name);
            if (!definition) {
              errors.push(createError(`选项写入未定义变量：${name}`, script.id, node.id));
            } else if (value !== null && getValueType(value) !== definition.type) {
              errors.push(createError(`选项变量 ${name} 的写入类型必须是 ${definition.type}。`, script.id, node.id));
            }
          }
        }
      }

      if (node.type === "condition") {
        if (node.condition) validateConditionExpression(node.condition, variables, errors, script.id, node.id);
        for (const branch of node.branches ?? []) validateLegacyBranch(branch, variables, errors, script.id, node.id);
        if (!node.condition && !(node.branches?.length)) {
          errors.push(createError("ConditionNode 必须包含 condition 或 branches。", script.id, node.id));
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
