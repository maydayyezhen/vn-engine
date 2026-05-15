<script setup lang="ts">
import type { AssetItem, AssetType, VNProject } from "@vn-engine/vn-schema";
import AssetPreview from "./AssetPreview.vue";
import { updateAsset } from "../services/assetEditService";

/** 单个素材属性面板属性。 */
const props = defineProps<{
  /** 当前工程。 */
  project: VNProject;
  /** 当前选中的素材。 */
  asset?: AssetItem;
}>();

/** 单个素材属性面板事件。 */
const emit = defineEmits<{
  /** 工程发生变化。 */
  projectChange: [project: VNProject];
}>();

/** 可选素材类型。 */
const assetTypes: AssetType[] = ["background", "character", "prop", "bgm", "sound", "sfx", "voice", "image", "other"];

/** 更新当前素材。 */
function handleUpdateAsset(patch: Partial<AssetItem>): void {
  if (!props.asset) return;
  emit("projectChange", updateAsset(props.project, props.asset.id, patch));
}
</script>

<template>
  <section class="resource-inspector-panel">
    <template v-if="asset">
      <div class="resource-inspector-preview">
        <AssetPreview :asset="asset" :variant="asset.type === 'character' ? 'portrait' : 'wide'" />
      </div>

      <el-form label-position="top" class="resource-inspector-form">
        <el-form-item label="素材 id">
          <el-input :model-value="asset.id" size="small" @change="(value: string) => handleUpdateAsset({ id: value })" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input :model-value="asset.name" size="small" @update:model-value="(value: string) => handleUpdateAsset({ name: value })" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select :model-value="asset.type" size="small" @update:model-value="(value: AssetType) => handleUpdateAsset({ type: value })">
            <el-option v-for="type in assetTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径">
          <el-input :model-value="asset.path" size="small" @update:model-value="(value: string) => handleUpdateAsset({ path: value })" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input :model-value="asset.description" type="textarea" :rows="3" @update:model-value="(value: string) => handleUpdateAsset({ description: value })" />
        </el-form-item>
      </el-form>
    </template>
    <div v-else class="inspector-empty-state">
      <strong>未选择素材</strong>
      <span>在左侧资源管理器中点击具体素材后编辑。</span>
    </div>
  </section>
</template>
