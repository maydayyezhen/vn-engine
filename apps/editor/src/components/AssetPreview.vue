<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AssetItem } from "@vn-engine/vn-schema";
import { isAudioPreviewAsset, isImagePreviewAsset, resolveAssetPreviewUrl } from "../services/assetPreviewService";

/** 素材预览组件属性。 */
const props = withDefaults(
  defineProps<{
    /** 需要预览的素材；为空时显示无预览。 */
    asset?: AssetItem;
    /** 预览尺寸变体。 */
    variant?: "wide" | "portrait" | "audio";
  }>(),
  {
    variant: "wide"
  }
);

/** 当前资源是否加载失败。 */
const failed = ref(false);

/** 浏览器可访问的预览地址。 */
const previewUrl = computed(() => resolveAssetPreviewUrl(props.asset?.path));

/** 当前素材是否可以作为图片预览。 */
const canPreviewImage = computed(() => !!props.asset && isImagePreviewAsset(props.asset));

/** 当前素材是否可以作为音频预览。 */
const canPreviewAudio = computed(() => !!props.asset && isAudioPreviewAsset(props.asset));

/** 图片替代文本。 */
const previewAlt = computed(() => props.asset?.name || props.asset?.id || "素材预览");

watch(
  () => props.asset?.path,
  () => {
    failed.value = false;
  }
);
</script>

<template>
  <div class="asset-preview" :class="`asset-preview--${variant}`">
    <img
      v-if="canPreviewImage && previewUrl && !failed"
      class="asset-preview-image"
      :src="previewUrl"
      :alt="previewAlt"
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
  align-items: center;
}

.asset-preview--wide {
  min-height: 64px;
}

.asset-preview--portrait {
  min-height: 92px;
}

.asset-preview-image {
  object-fit: contain;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
}

.asset-preview--wide .asset-preview-image {
  width: 112px;
  height: 64px;
}

.asset-preview--portrait .asset-preview-image {
  width: 72px;
  height: 92px;
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
