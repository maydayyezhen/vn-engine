<script setup lang="ts">
import type { AssetItem, AssetType, VNProject } from "@vn-engine/vn-schema";
import { addAsset, createEmptyAsset, deleteAsset, updateAsset } from "../services/assetEditService";

/** 素材库面板属性。 */
const props = defineProps<{
  /** 当前工程。 */
  project: VNProject;
  /** 是否运行在 Tauri 桌面环境。 */
  desktopMode?: boolean;
}>();

/** 素材库面板事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
  /** 请求桌面端选择并导入素材文件。 */
  importAssetFile: [assetType: AssetType];
}>();

/** 可选素材类型。 */
const assetTypes: AssetType[] = ["background", "character", "prop", "bgm", "sound", "sfx", "voice", "image", "other"];

/** 桌面端文件导入按钮对应的素材类型。 */
const desktopImportTypes: AssetType[] = ["background", "character", "prop", "bgm", "sound", "voice"];

/** 新增素材元数据。 */
function handleAddAsset(command: string | number | object): void {
  emit("projectChange", addAsset(props.project, createEmptyAsset(command as AssetType)));
}

/** 更新素材元数据。 */
function handleUpdateAsset(assetId: string, patch: Partial<AssetItem>): void {
  emit("projectChange", updateAsset(props.project, assetId, patch));
}

/** 删除素材元数据。 */
function handleDeleteAsset(assetId: string): void {
  emit("projectChange", deleteAsset(props.project, assetId));
}

/** 请求桌面端导入素材文件。 */
function handleImportAsset(command: string | number | object): void {
  emit("importAssetFile", command as AssetType);
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>素材库</span>
        <div class="panel-actions">
          <el-dropdown @command="handleAddAsset">
            <el-button type="primary" size="small">新增素材</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="type in assetTypes" :key="type" :command="type">{{ type }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown :disabled="!desktopMode" @command="handleImportAsset">
            <el-button size="small" :disabled="!desktopMode">导入本地素材</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="type in desktopImportTypes" :key="type" :command="type">{{ type }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </template>

    <el-alert
      v-if="!desktopMode"
      class="asset-mode-alert"
      title="Web模式只能维护素材元数据；桌面版会把本地文件复制到工程 assets 目录并写入相对路径。"
      type="info"
      :closable="false"
      show-icon
    />

    <el-table :data="project.assets.items" height="100%">
      <el-table-column label="id" min-width="170">
        <template #default="{ row }">
          <el-input :model-value="row.id" size="small" @update:model-value="(value: string) => handleUpdateAsset(row.id, { id: value })" />
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="160">
        <template #default="{ row }">
          <el-input :model-value="row.name" size="small" @update:model-value="(value: string) => handleUpdateAsset(row.id, { name: value })" />
        </template>
      </el-table-column>
      <el-table-column label="类型" width="130">
        <template #default="{ row }">
          <el-select :model-value="row.type" size="small" @update:model-value="(value: AssetType) => handleUpdateAsset(row.id, { type: value })">
            <el-option v-for="type in assetTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="路径" min-width="260">
        <template #default="{ row }">
          <el-input :model-value="row.path" size="small" @update:model-value="(value: string) => handleUpdateAsset(row.id, { path: value })" />
        </template>
      </el-table-column>
      <el-table-column label="说明" min-width="220">
        <template #default="{ row }">
          <el-input :model-value="row.description" size="small" @update:model-value="(value: string) => handleUpdateAsset(row.id, { description: value })" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="handleDeleteAsset(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
