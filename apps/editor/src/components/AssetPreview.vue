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
    variant?: "wide" | "portrait" | "audio" | "thumbnail";
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

/** 当前素材是否是音频资源。 */
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
    <div v-else-if="canPreviewAudio" class="asset-preview-audio-card" :title="props.asset?.path" aria-label="音频资源">
      <svg class="asset-preview-audio-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M22 39h7l10 8V17L29 25h-7z" />
        <path d="M44 26c2.2 3.2 2.2 8.8 0 12" />
        <path d="M49 21c5.2 6.6 5.2 15.4 0 22" />
      </svg>
    </div>
    <span v-else class="asset-preview-empty">无预览</span>
  </div>
</template>

<style scoped>
.asset-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.asset-preview--wide {
  height: 64px;
  min-height: 0;
}

.asset-preview--portrait {
  height: 92px;
  min-height: 0;
}

.asset-preview--thumbnail {
  height: 62px;
  min-height: 0;
}

.asset-preview-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
}

.asset-preview--wide .asset-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-preview--portrait .asset-preview-image {
  width: auto;
  height: 100%;
}

.asset-preview--thumbnail .asset-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.asset-preview-audio-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #3ddc84;
}

.asset-preview-audio-icon {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.asset-preview-empty {
  color: #909399;
  font-size: 12px;
}
</style>
