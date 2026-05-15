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
import { Delete } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const props = defineProps<{
  project: VNProject;
}>();

const emit = defineEmits<{
  projectChange: [project: VNProject];
}>();

function characterAssets(): AssetItem[] {
  return props.project.assets.items.filter((asset) => asset.type === "character" || asset.type === "image");
}

function expressionAsset(assetId: string | undefined): AssetItem | undefined {
  return findAssetById(props.project, assetId);
}

function handleAddCharacter(): void {
  emit("projectChange", addCharacter(props.project, createEmptyCharacter()));
}

function handleUpdateCharacter(characterId: string, patch: Partial<Character>): void {
  emit("projectChange", updateCharacter(props.project, characterId, patch));
}

function handleDeleteCharacter(characterId: string): void {
  emit("projectChange", deleteCharacter(props.project, characterId));
}

function handleAddExpression(characterId: string): void {
  emit("projectChange", addCharacterExpression(props.project, characterId, createEmptyExpression(characterAssets()[0]?.id ?? "")));
}

function handleUpdateExpression(characterId: string, expressionId: string, patch: Partial<CharacterExpression>): void {
  emit("projectChange", updateCharacterExpression(props.project, characterId, expressionId, patch));
}

async function handleDeleteExpression(characterId: string, expressionId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("确定要删除该表情吗？删除后将无法恢复。", "删除表情", {
      customClass: "expression-delete-confirm",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
    emit("projectChange", deleteCharacterExpression(props.project, characterId, expressionId));
  } catch {
    return;
  }
}
</script>

<template>
  <el-card class="panel-card character-library-panel" shadow="never">
    <template #header>
      <div class="panel-header">
        <span class="character-library-title">角色管理</span>
        <el-button type="primary" size="small" @click="handleAddCharacter">新增角色</el-button>
      </div>
    </template>

    <el-scrollbar>
      <div class="character-list">
        <el-card v-for="character in project.characters" :key="character.id" shadow="never" class="character-card">
          <div class="character-grid">
            <el-input :model-value="character.id" size="small" placeholder="角色 id" @update:model-value="(value: string) => handleUpdateCharacter(character.id, { id: value })" />
            <el-input :model-value="character.name" size="small" placeholder="角色名" @update:model-value="(value: string) => handleUpdateCharacter(character.id, { name: value })" />
            <el-input
              :model-value="character.displayName"
              size="small"
              placeholder="显示名称"
              @update:model-value="(value: string) => handleUpdateCharacter(character.id, { displayName: value })"
            />
            <el-button size="small" @click="handleDeleteCharacter(character.id)">删除角色</el-button>
          </div>
          <el-input
            class="character-description"
            :model-value="character.description"
            size="small"
            placeholder="角色说明"
            @update:model-value="(value: string) => handleUpdateCharacter(character.id, { description: value })"
          />

          <div class="expression-header">
            <div class="expression-header-content">
              <strong>表情</strong>
            </div>
            <el-button size="small" @click="handleAddExpression(character.id)">新增表情</el-button>
          </div>

          <div class="expression-list">
            <div v-for="expression in character.expressions ?? []" :key="expression.id" class="expression-card">
              <AssetPreview :asset="expressionAsset(expression.assetId)" variant="portrait" class="expression-preview" />
              <div class="expression-content">
              <div class="expression-rowline">
                <label class="expression-kv">
                  <span class="expression-label">表情ID</span>
                  <el-input
                    :model-value="expression.id"
                      size="small"
                      placeholder="表情ID"
                      @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { id: value })"
                    />
                </label>
                <label class="expression-kv">
                  <div class="expression-label-row">
                    <span class="expression-label">表情名</span>
                    <el-button
                      size="small"
                      class="expression-delete-btn"
                      :icon="Delete"
                      circle
                      aria-label="删除表情"
                      @click="handleDeleteExpression(character.id, expression.id)"
                    />
                  </div>
                  <el-input
                    :model-value="expression.name"
                    size="small"
                    placeholder="表情名"
                    @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { name: value })"
                  />
                </label>
              </div>
              <label class="expression-kv expression-kv-material">
                <span class="expression-label">绑定素材</span>
                  <el-select
                    :model-value="expression.assetId"
                    size="small"
                    @update:model-value="(value: string) => handleUpdateExpression(character.id, expression.id, { assetId: value })"
                  >
                    <el-option v-for="asset in characterAssets()" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
                  </el-select>
                </label>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<style scoped>
.character-library-title {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
}
</style>
