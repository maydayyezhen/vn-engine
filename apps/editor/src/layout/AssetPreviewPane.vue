<script setup lang="ts">
import type { AssetItem } from "@vn-engine/vn-schema";
import AssetPreview from "../components/AssetPreview.vue";

/** 资源预览面板属性。 */
defineProps<{
  /** 当前预览素材。 */
  asset?: AssetItem;
}>();
</script>

<template>
  <section class="asset-preview-pane">
    <div class="panel-title-row">
      <strong>资源预览</strong>
    </div>
    <AssetPreview :asset="asset" :variant="asset?.type === 'character' ? 'portrait' : 'wide'" />
    <div v-if="asset" class="asset-preview-meta">
      <strong>{{ asset.name }}</strong>
      <span>{{ asset.id }}</span>
      <span>{{ asset.type }}</span>
      <small :title="asset.path">{{ asset.path }}</small>
    </div>
    <el-empty v-else class="compact-empty" description="暂无选中资源" />
  </section>
</template>
