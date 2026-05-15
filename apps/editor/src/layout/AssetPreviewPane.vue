<script setup lang="ts">
import type { AssetItem } from "@vn-engine/vn-schema";
import AssetPreview from "../components/AssetPreview.vue";

/** 资源预览面板属性。 */
defineProps<{
  /** 当前预览素材。 */
  asset?: AssetItem;
  /** 当前项目资源列表。 */
  assets: AssetItem[];
}>();
</script>

<template>
  <section class="asset-preview-pane">
    <div class="panel-title-row">
      <strong>资源展示</strong>
    </div>
    <div class="asset-preview-grid">
      <div v-for="item in assets" :key="item.id" class="asset-preview-tile" :class="{ active: item.id === asset?.id }">
        <AssetPreview :asset="item" variant="thumbnail" />
        <span :title="item.name">{{ item.name }}</span>
      </div>
    </div>
    <div v-if="asset" class="asset-preview-meta">
      <strong>{{ asset.name }}</strong>
      <span>{{ asset.id }} / {{ asset.type }}</span>
      <small :title="asset.path">{{ asset.path }}</small>
    </div>
    <el-empty v-else class="compact-empty" description="暂无选中资源" />
  </section>
</template>
