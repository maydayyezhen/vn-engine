<script setup lang="ts">
import type { AssetItem, Character, CharacterExpression, VNProject } from "@vn-engine/vn-schema";
import AssetPreview from "./AssetPreview.vue";
import {
  addCharacterExpression,
  createEmptyExpression,
  deleteCharacterExpression,
  updateCharacter,
  updateCharacterExpression
} from "../services/characterEditService";
import { findAssetById } from "../services/resourceLookupService";

/** 单个角色属性面板属性。 */
const props = defineProps<{
  /** 当前工程。 */
  project: VNProject;
  /** 当前选中的角色。 */
  character?: Character;
}>();

/** 单个角色属性面板事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
}>();

/** 获取可绑定到角色表情的素材。 */
function characterAssets(): AssetItem[] {
  return props.project.assets.items.filter((asset) => asset.type === "character" || asset.type === "image");
}

/** 获取表情绑定的素材。 */
function expressionAsset(assetId: string | undefined): AssetItem | undefined {
  return findAssetById(props.project, assetId);
}

/** 更新当前角色。 */
function handleUpdateCharacter(patch: Partial<Character>): void {
  if (!props.character) return;
  emit("projectChange", updateCharacter(props.project, props.character.id, patch));
}

/** 新增角色表情。 */
function handleAddExpression(): void {
  if (!props.character) return;
  emit("projectChange", addCharacterExpression(props.project, props.character.id, createEmptyExpression(characterAssets()[0]?.id ?? "")));
}

/** 更新角色表情。 */
function handleUpdateExpression(expressionId: string, patch: Partial<CharacterExpression>): void {
  if (!props.character) return;
  emit("projectChange", updateCharacterExpression(props.project, props.character.id, expressionId, patch));
}

/** 删除角色表情。 */
function handleDeleteExpression(expressionId: string): void {
  if (!props.character) return;
  emit("projectChange", deleteCharacterExpression(props.project, props.character.id, expressionId));
}
</script>

<template>
  <section class="resource-inspector-panel">
    <template v-if="character">
      <el-form label-position="top" class="resource-inspector-form">
        <el-form-item label="角色 id">
          <el-input :model-value="character.id" size="small" @change="(value: string) => handleUpdateCharacter({ id: value })" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input :model-value="character.name" size="small" @update:model-value="(value: string) => handleUpdateCharacter({ name: value })" />
        </el-form-item>
        <el-form-item label="显示名">
          <el-input :model-value="character.displayName" size="small" @update:model-value="(value: string) => handleUpdateCharacter({ displayName: value })" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input :model-value="character.description" type="textarea" :rows="3" @update:model-value="(value: string) => handleUpdateCharacter({ description: value })" />
        </el-form-item>
      </el-form>

      <div class="expression-header">
        <strong>表情</strong>
        <el-button size="small" @click="handleAddExpression">新增表情</el-button>
      </div>
      <div v-for="expression in character.expressions ?? []" :key="expression.id" class="expression-row inspector-expression-row">
        <AssetPreview :asset="expressionAsset(expression.assetId)" variant="portrait" />
        <el-input
          :model-value="expression.id"
          size="small"
          placeholder="表情 id"
          @change="(value: string) => handleUpdateExpression(expression.id, { id: value })"
        />
        <el-input
          :model-value="expression.name"
          size="small"
          placeholder="表情名"
          @update:model-value="(value: string) => handleUpdateExpression(expression.id, { name: value })"
        />
        <el-select :model-value="expression.assetId" size="small" @update:model-value="(value: string) => handleUpdateExpression(expression.id, { assetId: value })">
          <el-option v-for="asset in characterAssets()" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
        </el-select>
        <el-button size="small" type="danger" @click="handleDeleteExpression(expression.id)">删除表情</el-button>
      </div>
    </template>
    <div v-else class="inspector-empty-state">
      <strong>未选择角色</strong>
      <span>在左侧资源管理器中点击具体角色后编辑。</span>
    </div>
  </section>
</template>
