<script setup lang="ts">
import type { CharacterEnterEffect, CharacterExitEffect, CharacterPosition, ConditionBranch, ConditionExpression, NodeTarget, PlayAudioNode, StoryNode, TransitionType, VariableValue, VNProject } from "@vn-engine/vn-schema";
import { createDefaultAnimationRegistry, normalizeAnimationParams } from "@vn-engine/vn-renderer-pixi";
import {
  findAssetById,
  findCharacterById,
  findCharacterExpression,
  getAudioOptions,
  getBackgroundOptions,
  getCharacterOptions,
  getExpressionOptions,
  getPropOptions
} from "../services/resourceLookupService";
import { updateChoiceOption, updateConditionNode, updateNode, type StoryNodePatch } from "../services/scriptEditService";
import ConditionEditor from "./condition/ConditionEditor.vue";
import TargetSelector from "./target/TargetSelector.vue";
import ActionSequenceEditor from "./action/ActionSequenceEditor.vue";
import AnimationSelector from "./animation/AnimationSelector.vue";
import AnimationTargetForm from "./animation/AnimationTargetForm.vue";
import AnimationParamForm from "./animation/AnimationParamForm.vue";
import { createDefaultVariableValue, findVariable } from "../services/variableEditService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前脚本 id。 */
  scriptId: string;
  /** 当前选中的剧情节点。 */
  node: StoryNode | null;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
  /** 定位跳转目标。 */
  locateTarget: [target: NodeTarget];
}>();

/** 条件运算符选项。 */
const conditionOperators: Array<{ label: string; value: ConditionBranch["operator"] }> = [
  { label: "等于", value: "equals" },
  { label: "不等于", value: "notEquals" },
  { label: "大于", value: "greaterThan" },
  { label: "小于", value: "lessThan" },
  { label: "存在", value: "exists" }
];

/** 角色位置选项。 */
const positions: CharacterPosition[] = ["left", "center", "right", "custom"];
/** 背景转场选项。 */
const transitions: TransitionType[] = ["none", "fade", "slideLeft", "slideRight"];
/** 角色登场效果选项。 */
const enterEffects: CharacterEnterEffect[] = ["none", "fadeIn", "slideInLeft", "slideInRight"];
/** 角色退场效果选项。 */
const exitEffects: CharacterExitEffect[] = ["none", "fadeOut", "slideOutLeft", "slideOutRight"];

/** 音频通道选项。 */
const audioChannels: PlayAudioNode["channel"][] = ["bgm", "sound", "voice"];
/** 动画模块注册表。 */
const animationRegistry = createDefaultAnimationRegistry();

/** 将表单字符串转换为基础变量值。 */
function parseVariableValue(value: string): VariableValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/** 将变量值转换为表单字符串。 */
function formatVariableValue(value: VariableValue | undefined): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  return String(value);
}

/** 创建节点目标。 */
function createTarget(scriptId: string, nodeId: string): NodeTarget {
  return { scriptId, nodeId };
}

/** 获取指定脚本的节点列表。 */
function getNodesForScript(scriptId: string): StoryNode[] {
  return props.project.scripts.find((script) => script.id === scriptId)?.nodes ?? [];
}

/** 获取跳转节点的目标脚本 id。 */
function getJumpTargetScriptId(): string {
  return props.node?.type === "jump" ? props.node.target.scriptId : props.scriptId;
}

/** 获取跳转节点的目标节点 id。 */
function getJumpTargetNodeId(): string {
  return props.node?.type === "jump" ? props.node.target.nodeId ?? "" : "";
}

/** 更新跳转目标脚本。 */
function updateJumpTargetScript(scriptId: string): void {
  if (!props.node || props.node.type !== "jump") return;
  applyPatch({ target: createTarget(scriptId, props.node.target.nodeId ?? "") });
}

/** 更新跳转目标节点。 */
function updateJumpTargetNode(nodeId: string): void {
  if (!props.node || props.node.type !== "jump") return;
  applyPatch({ target: createTarget(props.node.target.scriptId, nodeId) });
}

/** 获取条件 true 分支。 */
function getConditionBranch(): ConditionBranch | undefined {
  return props.node?.type === "condition" ? props.node.branches?.[0] : undefined;
}

/** 获取条件 false 分支。 */
function getConditionFallback(): NodeTarget | undefined {
  return props.node?.type === "condition" ? props.node.fallbackTarget : undefined;
}

/** 更新条件 true 目标节点。 */
function updateConditionTrueNode(nodeId: string): void {
  const branch = getConditionBranch();
  applyConditionPatch({ trueTarget: createTarget(branch?.target.scriptId || props.scriptId, nodeId) });
}

/** 更新条件 false 目标节点。 */
function updateConditionFalseNode(nodeId: string): void {
  const fallback = getConditionFallback();
  applyConditionPatch({ falseTarget: createTarget(fallback?.scriptId || props.scriptId, nodeId) });
}

/** 应用节点补丁。 */
function applyPatch(patch: StoryNodePatch): void {
  if (!props.node) return;
  emit("projectChange", updateNode(props.project, props.scriptId, props.node.id, patch));
}

/** 更新选项文本。 */
function updateOptionText(optionId: string, text: string): void {
  if (!props.node || props.node.type !== "choice") return;
  const nextNode = updateChoiceOption(props.node, optionId, { text });
  applyPatch(nextNode);
}

/** 更新选项跳转目标。 */
function updateOptionTarget(optionId: string, field: keyof NodeTarget, value: string): void {
  if (!props.node || props.node.type !== "choice") return;
  const option = props.node.options.find((item) => item.id === optionId);
  if (!option) return;
  const nextTarget = { ...option.target, [field]: value };
  const nextNode = updateChoiceOption(props.node, optionId, { target: nextTarget });
  applyPatch(nextNode);
}

/** 更新选项跳转目标。 */
function updateOptionFullTarget(optionId: string, target: NodeTarget): void {
  if (!props.node || props.node.type !== "choice") return;
  const nextNode = updateChoiceOption(props.node, optionId, { target });
  applyPatch(nextNode);
}

/** 更新条件节点。 */
function applyConditionPatch(patch: Parameters<typeof updateConditionNode>[1]): void {
  if (!props.node || props.node.type !== "condition") return;
  const nextNode = updateConditionNode(props.node, patch);
  applyPatch(nextNode);
}

/** 更新结构化条件表达式。 */
function updateConditionExpression(condition: ConditionExpression): void {
  if (!props.node || props.node.type !== "condition") return;
  applyPatch({ condition });
}

/** 获取条件 true 目标。 */
function getConditionTrueTarget(): NodeTarget | undefined {
  if (props.node?.type !== "condition") return undefined;
  return props.node.trueTarget ?? props.node.branches?.[0]?.target;
}

/** 获取条件 false 目标。 */
function getConditionFalseTarget(): NodeTarget | undefined {
  if (props.node?.type !== "condition") return undefined;
  return props.node.falseTarget ?? props.node.fallbackTarget;
}

/** 获取变量赋值节点变量名。 */
function getSetVariableName(): string {
  return props.node?.type === "setVariable" ? props.node.variableName ?? props.node.name ?? "" : "";
}

/** 更新变量赋值节点变量名，并按变量类型补默认值。 */
function updateSetVariableName(variableName: string): void {
  const variable = findVariable(props.project, variableName);
  applyPatch({ variableName, name: variableName, value: variable ? createDefaultVariableValue(variable.type) : "" });
}

/** 更新变量赋值节点的值。 */
function updateSetVariableValue(value: string | number | boolean): void {
  if (!props.node || props.node.type !== "setVariable") return;
  const variable = findVariable(props.project, getSetVariableName());
  if (variable?.type === "boolean") applyPatch({ value: Boolean(value) });
  else if (variable?.type === "number") applyPatch({ value: Number(value) });
  else applyPatch({ value: String(value) });
}

/** 更新角色显示节点的角色，并同步默认表情素材。 */
function updateShowCharacter(characterId: string): void {
  if (!props.node || props.node.type !== "showCharacter") return;
  const expression = getExpressionOptions(props.project, characterId)[0];
  applyPatch({
    characterId,
    expression: expression?.id,
    assetId: expression?.assetId
  });
}

/** 更新角色显示节点的表情，并同步立绘素材。 */
function updateShowExpression(expressionId: string): void {
  if (!props.node || props.node.type !== "showCharacter") return;
  const expression = findCharacterExpression(props.project, props.node.characterId, expressionId);
  applyPatch({
    expression: expressionId,
    assetId: expression?.assetId
  });
}

/** 更新物品显示节点的素材。 */
function updateShowPropAsset(assetId: string): void {
  if (!props.node || props.node.type !== "showProp") return;
  const asset = findAssetById(props.project, assetId);
  applyPatch({
    assetId,
    propId: props.node.propId || assetId,
    name: props.node.name || asset?.name
  });
}

/** 获取当前资源缺失警告。 */
function getMissingResourceWarning(): string {
  if (!props.node) return "";
  if (props.node.type === "scene" && !findAssetById(props.project, props.node.backgroundAssetId)) return "当前背景素材不存在。";
  if (props.node.type === "showCharacter") {
    if (!findCharacterById(props.project, props.node.characterId)) return "当前角色不存在。";
    if (props.node.expression && !findCharacterExpression(props.project, props.node.characterId, props.node.expression)) return "当前表情不存在。";
  }
  if (props.node.type === "playAudio" && !findAssetById(props.project, props.node.assetId)) return "当前音频素材不存在。";
  if (props.node.type === "showProp" && !findAssetById(props.project, props.node.assetId)) return "当前物品素材不存在。";
  return "";
}

/** 获取当前动画节点选择的动画模块。 */
function getSelectedAnimation() {
  return props.node?.type === "playAnimation" ? animationRegistry.get(props.node.animationId) : undefined;
}

/** 更新动画 id，并按模块默认值重置目标和参数。 */
function updatePlayAnimationId(animationId: string): void {
  const animation = animationRegistry.get(animationId);
  const targets = Object.fromEntries((animation?.targetSlots ?? []).map((slot) => [
    slot.key,
    {
      type: slot.type,
      id: slot.type === "character" ? props.project.characters[0]?.id : slot.type === "prop" ? getPropOptions(props.project)[0]?.id : undefined
    }
  ]));
  const params = animation ? normalizeAnimationParams(animation.paramsSchema, {}) : {};
  applyPatch({ animationId, targets, params });
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>节点属性</template>
    <el-empty v-if="!node" description="请选择节点" />
    <el-form v-else label-position="top" class="property-form">
      <el-alert v-if="getMissingResourceWarning()" :title="getMissingResourceWarning()" type="warning" :closable="false" show-icon />

      <el-form-item label="节点 id">
        <el-input :model-value="node.id" disabled />
      </el-form-item>
      <el-form-item label="节点类型">
        <el-input :model-value="node.type" disabled />
      </el-form-item>

      <template v-if="node.type === 'dialogue'">
        <el-form-item label="speakerId / characterId">
          <el-select :model-value="node.characterId" @update:model-value="(value: string) => applyPatch({ characterId: value })">
            <el-option v-for="character in getCharacterOptions(project)" :key="character.id" :label="character.displayName || character.name" :value="character.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="text">
          <el-input
            :model-value="node.text"
            class="panel-long-textarea"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            @update:model-value="(value: string) => applyPatch({ text: value })"
          />
        </el-form-item>
        <el-form-item label="textSpeed">
          <el-input-number :model-value="node.textSpeed ?? 30" :min="1" :max="200" @update:model-value="(value: number | undefined) => applyPatch({ textSpeed: value ?? 30 })" />
        </el-form-item>
        <el-form-item label="autoNext">
          <el-switch :model-value="node.autoNext ?? false" @update:model-value="(value: boolean) => applyPatch({ autoNext: value })" />
        </el-form-item>
        <el-form-item label="waitForClick">
          <el-switch :model-value="node.waitForClick ?? true" @update:model-value="(value: boolean) => applyPatch({ waitForClick: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'narration'">
        <el-form-item label="text">
          <el-input
            :model-value="node.text"
            class="panel-long-textarea"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            @update:model-value="(value: string) => applyPatch({ text: value })"
          />
        </el-form-item>
        <el-form-item label="textSpeed">
          <el-input-number :model-value="node.textSpeed ?? 30" :min="1" :max="200" @update:model-value="(value: number | undefined) => applyPatch({ textSpeed: value ?? 30 })" />
        </el-form-item>
        <el-form-item label="autoNext">
          <el-switch :model-value="node.autoNext ?? false" @update:model-value="(value: boolean) => applyPatch({ autoNext: value })" />
        </el-form-item>
        <el-form-item label="waitForClick">
          <el-switch :model-value="node.waitForClick ?? true" @update:model-value="(value: boolean) => applyPatch({ waitForClick: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'choice'">
        <el-form-item label="prompt">
          <el-input :model-value="node.prompt" @update:model-value="(value: string) => applyPatch({ prompt: value })" />
        </el-form-item>
        <el-divider>选项</el-divider>
        <div v-for="option in node.options" :key="option.id" class="choice-editor">
          <el-form-item :label="`选项文本：${option.id}`">
            <el-input :model-value="option.text" @update:model-value="(value: string) => updateOptionText(option.id, value)" />
          </el-form-item>
          <el-form-item label="target">
            <TargetSelector :project="project" :target="option.target" @update-target="(target) => updateOptionFullTarget(option.id, target)" />
            <el-button size="small" @click="$emit('locateTarget', option.target)">定位目标</el-button>
          </el-form-item>
        </div>
      </template>

      <template v-else-if="node.type === 'scene'">
        <el-form-item label="backgroundAssetId">
          <el-select :model-value="node.backgroundAssetId" filterable @update:model-value="(value: string) => applyPatch({ backgroundAssetId: value })">
            <el-option v-for="asset in getBackgroundOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="transition">
          <el-select :model-value="node.transition ?? 'none'" @update:model-value="(value: TransitionType) => applyPatch({ transition: value })">
            <el-option v-for="transition in transitions" :key="transition" :label="transition" :value="transition" />
          </el-select>
        </el-form-item>
        <el-form-item label="transitionDurationMs">
          <el-input-number :model-value="node.transitionDurationMs ?? 300" :min="0" :max="5000" @update:model-value="(value: number | undefined) => applyPatch({ transitionDurationMs: value ?? 300 })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'showCharacter'">
        <el-form-item label="characterId">
          <el-select :model-value="node.characterId" filterable @update:model-value="updateShowCharacter">
            <el-option v-for="character in getCharacterOptions(project)" :key="character.id" :label="`${character.displayName || character.name} (${character.id})`" :value="character.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="expression">
          <el-select :model-value="node.expression" filterable @update:model-value="updateShowExpression">
            <el-option v-for="expression in getExpressionOptions(project, node.characterId)" :key="expression.id" :label="`${expression.name} (${expression.id})`" :value="expression.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="position">
          <el-select :model-value="node.position ?? 'center'" @update:model-value="(value: CharacterPosition) => applyPatch({ position: value })">
            <el-option v-for="position in positions" :key="position" :label="position" :value="position" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="node.position === 'custom'" label="custom x / y">
          <div class="inline-fields">
            <el-input-number :model-value="node.x ?? 640" @update:model-value="(value: number | undefined) => applyPatch({ x: value ?? 640 })" />
            <el-input-number :model-value="node.y ?? 575" @update:model-value="(value: number | undefined) => applyPatch({ y: value ?? 575 })" />
          </div>
        </el-form-item>
        <el-form-item label="scale">
          <el-input-number :model-value="node.scale ?? 1" :min="0.1" :max="5" :step="0.1" @update:model-value="(value: number | undefined) => applyPatch({ scale: value ?? 1 })" />
        </el-form-item>
        <el-form-item label="opacity">
          <el-input-number :model-value="node.opacity ?? 1" :min="0" :max="1" :step="0.05" @update:model-value="(value: number | undefined) => applyPatch({ opacity: value ?? 1 })" />
        </el-form-item>
        <el-form-item label="zIndex">
          <el-input-number :model-value="node.zIndex ?? 0" @update:model-value="(value: number | undefined) => applyPatch({ zIndex: value ?? 0 })" />
        </el-form-item>
        <el-form-item label="flipX">
          <el-switch :model-value="node.flipX ?? false" @update:model-value="(value: boolean) => applyPatch({ flipX: value })" />
        </el-form-item>
        <el-form-item label="enterEffect">
          <el-select :model-value="node.enterEffect ?? 'none'" @update:model-value="(value: CharacterEnterEffect) => applyPatch({ enterEffect: value })">
            <el-option v-for="effect in enterEffects" :key="effect" :label="effect" :value="effect" />
          </el-select>
        </el-form-item>
        <el-form-item label="transitionDurationMs">
          <el-input-number :model-value="node.transitionDurationMs ?? 300" :min="0" :max="5000" @update:model-value="(value: number | undefined) => applyPatch({ transitionDurationMs: value ?? 300 })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'hideCharacter'">
        <el-form-item label="characterId">
          <el-select :model-value="node.characterId" filterable @update:model-value="(value: string) => applyPatch({ characterId: value })">
            <el-option v-for="character in getCharacterOptions(project)" :key="character.id" :label="`${character.displayName || character.name} (${character.id})`" :value="character.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="exitEffect">
          <el-select :model-value="node.exitEffect ?? 'none'" @update:model-value="(value: CharacterExitEffect) => applyPatch({ exitEffect: value })">
            <el-option v-for="effect in exitEffects" :key="effect" :label="effect" :value="effect" />
          </el-select>
        </el-form-item>
        <el-form-item label="transitionDurationMs">
          <el-input-number :model-value="node.transitionDurationMs ?? 300" :min="0" :max="5000" @update:model-value="(value: number | undefined) => applyPatch({ transitionDurationMs: value ?? 300 })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'showProp'">
        <el-form-item label="prop resource">
          <el-select :model-value="node.assetId" filterable @update:model-value="updateShowPropAsset">
            <el-option v-for="asset in getPropOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="propId">
          <el-input :model-value="node.propId" @update:model-value="(value: string) => applyPatch({ propId: value })" />
        </el-form-item>
        <el-form-item label="name">
          <el-input :model-value="node.name" @update:model-value="(value: string) => applyPatch({ name: value })" />
        </el-form-item>
        <el-form-item label="x / y">
          <div class="inline-fields">
            <el-input-number :model-value="node.x ?? 640" @update:model-value="(value: number | undefined) => applyPatch({ x: value ?? 640 })" />
            <el-input-number :model-value="node.y ?? 360" @update:model-value="(value: number | undefined) => applyPatch({ y: value ?? 360 })" />
          </div>
        </el-form-item>
        <el-form-item label="scale">
          <el-input-number :model-value="node.scale ?? 1" :min="0.1" :max="5" :step="0.1" @update:model-value="(value: number | undefined) => applyPatch({ scale: value ?? 1 })" />
        </el-form-item>
        <el-form-item label="opacity">
          <el-input-number :model-value="node.opacity ?? 1" :min="0" :max="1" :step="0.05" @update:model-value="(value: number | undefined) => applyPatch({ opacity: value ?? 1 })" />
        </el-form-item>
        <el-form-item label="zIndex">
          <el-input-number :model-value="node.zIndex ?? 10" @update:model-value="(value: number | undefined) => applyPatch({ zIndex: value ?? 10 })" />
        </el-form-item>
        <el-form-item label="rotation">
          <el-input-number :model-value="node.rotation ?? 0" :step="0.1" @update:model-value="(value: number | undefined) => applyPatch({ rotation: value ?? 0 })" />
        </el-form-item>
        <el-form-item label="flipX">
          <el-switch :model-value="node.flipX ?? false" @update:model-value="(value: boolean) => applyPatch({ flipX: value })" />
        </el-form-item>
        <el-form-item label="enterAnimationId">
          <AnimationSelector :model-value="node.enterAnimationId ?? 'prop.revealCenter'" @update:model-value="(value) => applyPatch({ enterAnimationId: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'hideProp'">
        <el-form-item label="propId">
          <el-input :model-value="node.propId" @update:model-value="(value: string) => applyPatch({ propId: value })" />
        </el-form-item>
        <el-form-item label="exitAnimationId">
          <AnimationSelector :model-value="node.exitAnimationId ?? 'prop.fadeOut'" @update:model-value="(value) => applyPatch({ exitAnimationId: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'camera'">
        <el-form-item label="zoom">
          <el-input-number :model-value="node.zoom ?? 1" :min="0.1" :max="5" :step="0.1" @update:model-value="(value: number | undefined) => applyPatch({ zoom: value ?? 1 })" />
        </el-form-item>
        <el-form-item label="offsetX">
          <el-input-number :model-value="node.offsetX ?? 0" @update:model-value="(value: number | undefined) => applyPatch({ offsetX: value ?? 0 })" />
        </el-form-item>
        <el-form-item label="offsetY">
          <el-input-number :model-value="node.offsetY ?? 0" @update:model-value="(value: number | undefined) => applyPatch({ offsetY: value ?? 0 })" />
        </el-form-item>
        <el-form-item label="shake">
          <el-switch :model-value="node.shake ?? false" @update:model-value="(value: boolean) => applyPatch({ shake: value })" />
        </el-form-item>
        <el-form-item label="shakeIntensity">
          <el-input-number :model-value="node.shakeIntensity ?? 0" :min="0" :max="100" @update:model-value="(value: number | undefined) => applyPatch({ shakeIntensity: value ?? 0 })" />
        </el-form-item>
        <el-form-item label="durationMs">
          <el-input-number :model-value="node.durationMs ?? 300" :min="0" :max="5000" @update:model-value="(value: number | undefined) => applyPatch({ durationMs: value ?? 300 })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'actionSequence'">
        <ActionSequenceEditor :project="project" :node="node" @update-node="applyPatch" />
      </template>

      <template v-else-if="node.type === 'playAnimation'">
        <el-form-item label="动画模块">
          <AnimationSelector :model-value="node.animationId" @update:model-value="updatePlayAnimationId" />
        </el-form-item>
        <AnimationTargetForm
          :project="project"
          :animation="getSelectedAnimation()"
          :targets="node.targets"
          @update-targets="(targets) => applyPatch({ targets })"
        />
        <AnimationParamForm
          :animation="getSelectedAnimation()"
          :params="node.params ?? {}"
          @update-params="(params) => applyPatch({ params })"
        />
        <el-form-item label="waitForCompletion">
          <el-switch :model-value="node.waitForCompletion ?? true" @update:model-value="(value: boolean) => applyPatch({ waitForCompletion: value })" />
        </el-form-item>
        <el-form-item label="autoNext">
          <el-switch :model-value="node.autoNext ?? true" @update:model-value="(value: boolean) => applyPatch({ autoNext: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'playAudio'">
        <el-form-item label="channel">
          <el-select :model-value="node.channel" @update:model-value="(value: PlayAudioNode['channel']) => applyPatch({ channel: value })">
            <el-option v-for="channel in audioChannels" :key="channel" :label="channel" :value="channel" />
          </el-select>
        </el-form-item>
        <el-form-item label="assetId">
          <el-select :model-value="node.assetId" filterable @update:model-value="(value: string) => applyPatch({ assetId: value })">
            <el-option v-for="asset in getAudioOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="loop">
          <el-switch :model-value="node.loop" @update:model-value="(value: boolean) => applyPatch({ loop: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'stopAudio'">
        <el-form-item label="channel">
          <el-select :model-value="node.channel" @update:model-value="(value: PlayAudioNode['channel']) => applyPatch({ channel: value })">
            <el-option v-for="channel in audioChannels" :key="channel" :label="channel" :value="channel" />
          </el-select>
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'jump'">
        <el-form-item label="target">
          <TargetSelector :project="project" :target="node.target" @update-target="(target) => applyPatch({ target })" />
          <el-button size="small" @click="$emit('locateTarget', node.target)">定位目标</el-button>
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'setVariable'">
        <el-form-item label="variableName">
          <el-select :model-value="getSetVariableName()" filterable @update:model-value="updateSetVariableName">
            <el-option v-for="variable in project.variables ?? []" :key="variable.name" :label="`${variable.name} (${variable.type})`" :value="variable.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="operator">
          <el-select :model-value="node.operator ?? 'set'" @update:model-value="(value: 'set' | 'add' | 'subtract') => applyPatch({ operator: value })">
            <el-option label="set" value="set" />
            <el-option label="add" value="add" />
            <el-option label="subtract" value="subtract" />
          </el-select>
        </el-form-item>
        <el-form-item label="value">
          <el-switch
            v-if="findVariable(project, getSetVariableName())?.type === 'boolean'"
            :model-value="Boolean(node.value)"
            @update:model-value="updateSetVariableValue"
          />
          <el-input-number
            v-else-if="findVariable(project, getSetVariableName())?.type === 'number'"
            :model-value="Number(node.value)"
            @update:model-value="(value: number | undefined) => updateSetVariableValue(value ?? 0)"
          />
          <el-input v-else :model-value="formatVariableValue(node.value)" @update:model-value="updateSetVariableValue" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'condition'">
        <ConditionEditor :project="project" :condition="node.condition" @update-condition="updateConditionExpression" />
        <el-form-item label="trueTarget">
          <TargetSelector :project="project" :target="getConditionTrueTarget()" @update-target="(target) => applyPatch({ trueTarget: target })" />
          <el-button v-if="getConditionTrueTarget()" size="small" @click="$emit('locateTarget', getConditionTrueTarget()!)">定位 true 目标</el-button>
        </el-form-item>
        <el-form-item label="falseTarget">
          <TargetSelector :project="project" :target="getConditionFalseTarget()" @update-target="(target) => applyPatch({ falseTarget: target })" />
          <el-button v-if="getConditionFalseTarget()" size="small" @click="$emit('locateTarget', getConditionFalseTarget()!)">定位 false 目标</el-button>
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'label'">
        <el-form-item label="name">
          <el-input :model-value="node.name" @update:model-value="(value: string) => applyPatch({ name: value })" />
        </el-form-item>
        <el-form-item label="description">
          <el-input
            :model-value="node.description"
            class="panel-long-textarea"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 8 }"
            @update:model-value="(value: string) => applyPatch({ description: value })"
          />
        </el-form-item>
      </template>

      <el-alert v-else title="该节点类型本轮暂不提供表单编辑。" type="info" :closable="false" />
    </el-form>
  </el-card>
</template>
