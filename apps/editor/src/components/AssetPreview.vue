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
    <div v-else-if="canPreviewAudio && previewUrl" class="asset-preview-audio-card" :title="props.asset?.path" aria-label="音频资源">
      <audio
        class="asset-preview-audio-player"
        controls
        preload="metadata"
        :src="previewUrl"
        @error="failed = true"
      />
    </div>
    <div v-else-if="canPreviewAudio" class="asset-preview-audio-card asset-preview-audio-card--no-source" :title="props.asset?.path" aria-label="音频资源">
      <span class="asset-preview-audio-fallback">无可用音频路径</span>
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
  width: 100%;
  min-width: 0;
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
  height: auto;
  max-height: 100%;
  object-fit: contain;
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
  background: transparent;
  overflow: hidden;
}

.asset-preview-audio-player {
  width: 100%;
  height: 20px;
  max-width: 100%;
}

.asset-preview-audio-card--no-source {
  padding: 0 6px;
}

.asset-preview-audio-fallback {
  color: #98a2b3;
  font-size: 11px;
}

.asset-preview-empty {
  color: #909399;
  font-size: 12px;
}
</style>
