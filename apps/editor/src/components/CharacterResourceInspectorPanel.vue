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
import { Delete } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const props = defineProps<{
  project: VNProject;
  character?: Character;
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

function handleUpdateCharacter(patch: Partial<Character>): void {
  if (!props.character) return;
  emit("projectChange", updateCharacter(props.project, props.character.id, patch));
}

function handleAddExpression(): void {
  if (!props.character) return;
  emit("projectChange", addCharacterExpression(props.project, props.character.id, createEmptyExpression(characterAssets()[0]?.id ?? "")));
}

function handleUpdateExpression(expressionId: string, patch: Partial<CharacterExpression>): void {
  if (!props.character) return;
  emit("projectChange", updateCharacterExpression(props.project, props.character.id, expressionId, patch));
}

async function handleDeleteExpression(expressionId: string): Promise<void> {
  if (!props.character) return;
  try {
    await ElMessageBox.confirm("确定要删除该表情吗？删除后将无法恢复。", "删除表情", {
      customClass: "expression-delete-confirm",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
    emit("projectChange", deleteCharacterExpression(props.project, props.character.id, expressionId));
  } catch {
    return;
  }
}
</script>

<template>
  <section class="resource-inspector-panel">
    <template v-if="character">
      <el-form label-position="top" class="resource-inspector-form character-inspector-form">
        <el-form-item label="角色 id">
          <el-input :model-value="character.id" size="small" @change="(value: string) => handleUpdateCharacter({ id: value })" />
        </el-form-item>
        <el-form-item label="角色名">
          <el-input :model-value="character.name" size="small" @update:model-value="(value: string) => handleUpdateCharacter({ name: value })" />
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input :model-value="character.displayName" size="small" @update:model-value="(value: string) => handleUpdateCharacter({ displayName: value })" />
        </el-form-item>
        <el-form-item label="角色说明" class="character-inspector-form-full">
          <el-input
            :model-value="character.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 10 }"
            class="character-inspector-textarea panel-long-textarea"
            @update:model-value="(value: string) => handleUpdateCharacter({ description: value })"
          />
        </el-form-item>
      </el-form>

      <div class="expression-header">
        <div class="expression-header-content">
          <strong>表情</strong>
        </div>
        <el-button size="small" @click="handleAddExpression">新增表情</el-button>
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
                  @change="(value: string) => handleUpdateExpression(expression.id, { id: value })"
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
                    @click="handleDeleteExpression(expression.id)"
                  />
                </div>
                <el-input
                  :model-value="expression.name"
                  size="small"
                  placeholder="表情名"
                  @update:model-value="(value: string) => handleUpdateExpression(expression.id, { name: value })"
                />
              </label>
            </div>
            <label class="expression-kv expression-kv-material">
              <span class="expression-label">绑定素材</span>
              <el-select
                :model-value="expression.assetId"
                size="small"
                @update:model-value="(value: string) => handleUpdateExpression(expression.id, { assetId: value })"
              >
                <el-option v-for="asset in characterAssets()" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
              </el-select>
            </label>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="inspector-empty-state">
      <strong>未选择角色</strong>
      <span>请在左侧资源管理器中选中角色后进行编辑。</span>
    </div>
  </section>
</template>
