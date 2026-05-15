<script setup lang="ts">
import type { AssetItem, Character, CharacterExpression, VNProject } from "@vn-engine/vn-schema";
import AssetPreview from "./AssetPreview.vue";
import {
  addCharacter,
  addCharacterExpression,
  createEmptyCharacter,
  createEmptyExpression,
  deleteCharacter,
  deleteCharacterExpression,
  updateCharacter,
  updateCharacterExpression
} from "../services/characterEditService";
import { findAssetById } from "../services/resourceLookupService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程。 */
  project: VNProject;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
}>();

/** 角色图片素材列表。 */
function characterAssets(): AssetItem[] {
  return props.project.assets.items.filter((asset) => asset.type === "character" || asset.type === "image");
}

/** 获取表情绑定的素材。 */
function expressionAsset(assetId: string | undefined): AssetItem | undefined {
  return findAssetById(props.project, assetId);
}

/** 新增角色。 */
function handleAddCharacter(): void {
  emit("projectChange", addCharacter(props.project, createEmptyCharacter()));
}

/** 更新角色。 */
function handleUpdateCharacter(characterId: string, patch: Partial<Character>): void {
  emit("projectChange", updateCharacter(props.project, characterId, patch));
}

/** 删除角色。 */
function handleDeleteCharacter(characterId: string): void {
  emit("projectChange", deleteCharacter(props.project, characterId));
}

/** 新增表情。 */
function handleAddExpression(characterId: string): void {
  emit("projectChange", addCharacterExpression(props.project, characterId, createEmptyExpression(characterAssets()[0]?.id ?? "")));
}

/** 更新表情。 */
function handleUpdateExpression(characterId: string, expressionId: string, patch: Partial<CharacterExpression>): void {
  emit("projectChange", updateCharacterExpression(props.project, characterId, expressionId, patch));
}

/** 删除表情。 */
function handleDeleteExpression(characterId: string, expressionId: string): void {
  emit("projectChange", deleteCharacterExpression(props.project, characterId, expressionId));
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>角色管理</span>
        <el-button type="primary" size="small" @click="handleAddCharacter">新增角色</el-button>
      </div>
    </template>

    <el-scrollbar>
      <div class="character-list">
        <el-card v-for="character in project.characters" :key="character.id" shadow="never" class="character-card">
          <div class="character-grid">
            <el-input :model-value="character.id" size="small" placeholder="角色 id" @update:model-value="(value: string) => handleUpdateCharacter(character.id, { id: value })" />
            <el-input :model-value="character.name" size="small" placeholder="名称" @update:model-value="(value: string) => handleUpdateCharacter(character.id, { name: value })" />
            <el-input
              :model-value="character.displayName"
              size="small"
              placeholder="显示名"
              @update:model-value="(value: string) => handleUpdateCharacter(character.id, { displayName: value })"
            />
            <el-button size="small" type="danger" @click="handleDeleteCharacter(character.id)">删除角色</el-button>
          </div>
          <el-input
            class="character-description"
            :model-value="character.description"
            size="small"
            placeholder="说明"
            @update:model-value="(value: string) => handleUpdateCharacter(character.id, { description: value })"
          />
          <div class="expression-header">
            <strong>表情</strong>
            <el-button size="small" @click="handleAddExpression(character.id)">新增表情</el-button>
          </div>
          <div v-for="expression in character.expressions ?? []" :key="expression.id" class="expression-row">
            <AssetPreview :asset="expressionAsset(expression.assetId)" variant="portrait" />
            <el-input
              :model-value="expression.id"
              size="small"
              placeholder="表情 id"
              @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { id: value })"
            />
            <el-input
              :model-value="expression.name"
              size="small"
              placeholder="表情名"
              @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { name: value })"
            />
            <el-select :model-value="expression.assetId" size="small" @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { assetId: value })">
              <el-option v-for="asset in characterAssets()" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
            </el-select>
            <el-button size="small" type="danger" @click="handleDeleteExpression(character.id, expression.id)">删除</el-button>
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </el-card>
</template>
