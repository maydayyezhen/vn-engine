<script setup lang="ts">
import type { ConditionBranch, NodeTarget, PlayAudioNode, StoryNode, VariableValue, VNProject } from "@vn-engine/vn-schema";
import {
  findAssetById,
  findCharacterById,
  findCharacterExpression,
  getAudioOptions,
  getBackgroundOptions,
  getCharacterOptions,
  getExpressionOptions
} from "../services/resourceLookupService";
import { updateChoiceOption, updateConditionNode, updateNode, type StoryNodePatch } from "../services/scriptEditService";

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
const positions = ["left", "center", "right"] as const;

/** 音频通道选项。 */
const audioChannels: PlayAudioNode["channel"][] = ["bgm", "sfx", "voice"];

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
  return props.node?.type === "jump" ? props.node.target.nodeId : "";
}

/** 更新跳转目标脚本。 */
function updateJumpTargetScript(scriptId: string): void {
  if (!props.node || props.node.type !== "jump") return;
  applyPatch({ target: createTarget(scriptId, props.node.target.nodeId) });
}

/** 更新跳转目标节点。 */
function updateJumpTargetNode(nodeId: string): void {
  if (!props.node || props.node.type !== "jump") return;
  applyPatch({ target: createTarget(props.node.target.scriptId, nodeId) });
}

/** 获取条件 true 分支。 */
function getConditionBranch(): ConditionBranch | undefined {
  return props.node?.type === "condition" ? props.node.branches[0] : undefined;
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

/** 更新条件节点。 */
function applyConditionPatch(patch: Parameters<typeof updateConditionNode>[1]): void {
  if (!props.node || props.node.type !== "condition") return;
  const nextNode = updateConditionNode(props.node, patch);
  applyPatch(nextNode);
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

/** 获取当前资源缺失警告。 */
function getMissingResourceWarning(): string {
  if (!props.node) return "";
  if (props.node.type === "scene" && !findAssetById(props.project, props.node.backgroundAssetId)) return "当前背景素材不存在。";
  if (props.node.type === "showCharacter") {
    if (!findCharacterById(props.project, props.node.characterId)) return "当前角色不存在。";
    if (props.node.expression && !findCharacterExpression(props.project, props.node.characterId, props.node.expression)) return "当前表情不存在。";
  }
  if (props.node.type === "playAudio" && !findAssetById(props.project, props.node.assetId)) return "当前音频素材不存在。";
  return "";
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
          <el-input :model-value="node.text" type="textarea" :rows="4" @update:model-value="(value: string) => applyPatch({ text: value })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'narration'">
        <el-form-item label="text">
          <el-input :model-value="node.text" type="textarea" :rows="4" @update:model-value="(value: string) => applyPatch({ text: value })" />
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
          <el-form-item label="targetScriptId">
            <el-select :model-value="option.target.scriptId" @update:model-value="(value: string) => updateOptionTarget(option.id, 'scriptId', value)">
              <el-option v-for="script in project.scripts" :key="script.id" :label="script.name" :value="script.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="targetNodeId">
            <el-select :model-value="option.target.nodeId" @update:model-value="(value: string) => updateOptionTarget(option.id, 'nodeId', value)">
              <el-option
                v-for="targetNode in project.scripts.find((script) => script.id === option.target.scriptId)?.nodes ?? []"
                :key="targetNode.id"
                :label="`${targetNode.id} (${targetNode.type})`"
                :value="targetNode.id"
              />
            </el-select>
          </el-form-item>
        </div>
      </template>

      <template v-else-if="node.type === 'scene'">
        <el-form-item label="backgroundAssetId">
          <el-select :model-value="node.backgroundAssetId" filterable @update:model-value="(value: string) => applyPatch({ backgroundAssetId: value })">
            <el-option v-for="asset in getBackgroundOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
          </el-select>
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
          <el-select :model-value="node.position" @update:model-value="(value: 'left' | 'center' | 'right') => applyPatch({ position: value })">
            <el-option v-for="position in positions" :key="position" :label="position" :value="position" />
          </el-select>
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'hideCharacter'">
        <el-form-item label="characterId">
          <el-select :model-value="node.characterId" filterable @update:model-value="(value: string) => applyPatch({ characterId: value })">
            <el-option v-for="character in getCharacterOptions(project)" :key="character.id" :label="`${character.displayName || character.name} (${character.id})`" :value="character.id" />
          </el-select>
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
        <el-form-item label="targetScriptId">
          <el-select :model-value="getJumpTargetScriptId()" @update:model-value="updateJumpTargetScript">
            <el-option v-for="script in project.scripts" :key="script.id" :label="script.name" :value="script.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="targetNodeId">
          <el-select :model-value="getJumpTargetNodeId()" @update:model-value="updateJumpTargetNode">
            <el-option
              v-for="targetNode in getNodesForScript(getJumpTargetScriptId())"
              :key="targetNode.id"
              :label="`${targetNode.id} (${targetNode.type})`"
              :value="targetNode.id"
            />
          </el-select>
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'setVariable'">
        <el-form-item label="variableName">
          <el-input :model-value="node.name" @update:model-value="(value: string) => applyPatch({ name: value })" />
        </el-form-item>
        <el-form-item label="value">
          <el-input :model-value="formatVariableValue(node.value)" @update:model-value="(value: string) => applyPatch({ value: parseVariableValue(value) })" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'condition'">
        <el-form-item label="variableName">
          <el-input :model-value="getConditionBranch()?.variable" @update:model-value="(value: string) => applyConditionPatch({ variable: value })" />
        </el-form-item>
        <el-form-item label="operator">
          <el-select :model-value="getConditionBranch()?.operator" @update:model-value="(value: ConditionBranch['operator']) => applyConditionPatch({ operator: value })">
            <el-option v-for="operator in conditionOperators" :key="operator.value" :label="operator.label" :value="operator.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="compareValue">
          <el-input
            :model-value="formatVariableValue(getConditionBranch()?.value)"
            @update:model-value="(value: string) => applyConditionPatch({ value: parseVariableValue(value) })"
          />
        </el-form-item>
        <el-form-item label="trueTarget">
          <el-select :model-value="getConditionBranch()?.target.nodeId" @update:model-value="updateConditionTrueNode">
            <el-option v-for="targetNode in getNodesForScript(getConditionBranch()?.target.scriptId || scriptId)" :key="targetNode.id" :label="targetNode.id" :value="targetNode.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="falseTarget">
          <el-select :model-value="getConditionFallback()?.nodeId" @update:model-value="updateConditionFalseNode">
            <el-option v-for="targetNode in getNodesForScript(getConditionFallback()?.scriptId || scriptId)" :key="targetNode.id" :label="targetNode.id" :value="targetNode.id" />
          </el-select>
        </el-form-item>
      </template>

      <el-alert v-else title="该节点类型本轮暂不提供表单编辑。" type="info" :closable="false" />
    </el-form>
  </el-card>
</template>
