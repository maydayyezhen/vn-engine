<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AssetItem } from "@vn-engine/vn-schema";
import { isAudioPreviewAsset, isImagePreviewAsset, resolveAssetPreviewUrl } from "../services/assetPreviewService";

const props = defineProps<{
  asset: AssetItem;
}>();

const failed = ref(false);
const previewUrl = computed(() => resolveAssetPreviewUrl(props.asset.path));
const canPreviewImage = computed(() => isImagePreviewAsset(props.asset));
const canPreviewAudio = computed(() => isAudioPreviewAsset(props.asset));

watch(
  () => props.asset.path,
  () => {
    failed.value = false;
  }
);
</script>

<template>
  <div class="asset-preview">
    <img
      v-if="canPreviewImage && previewUrl && !failed"
      class="asset-preview-image"
      :src="previewUrl"
      :alt="asset.name || asset.id"
      loading="lazy"
      @error="failed = true"
    />
    <audio
      v-else-if="canPreviewAudio && previewUrl && !failed"
      class="asset-preview-audio"
      :src="previewUrl"
      controls
      preload="metadata"
      @error="failed = true"
    />
    <span v-else class="asset-preview-empty">无预览</span>
  </div>
</template>

<style scoped>
.asset-preview {
  display: flex;
  min-height: 56px;
  align-items: center;
}

.asset-preview-image {
  width: 112px;
  height: 64px;
  object-fit: contain;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
}

.asset-preview-audio {
  width: 180px;
  max-width: 100%;
}

.asset-preview-empty {
  color: #909399;
  font-size: 12px;
}
</style>
