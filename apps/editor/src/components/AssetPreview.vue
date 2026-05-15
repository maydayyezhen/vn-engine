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
    <div v-else-if="canPreviewAudio" class="asset-preview-audio-card" :title="props.asset?.path">
      <svg class="asset-preview-audio-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="10" width="48" height="44" rx="8" />
        <path d="M22 39h7l10 8V17L29 25h-7z" />
        <path d="M44 26c2.2 3.2 2.2 8.8 0 12" />
        <path d="M49 21c5.2 6.6 5.2 15.4 0 22" />
      </svg>
      <span>{{ props.asset?.type?.toUpperCase() }}</span>
    </div>
    <span v-else class="asset-preview-empty">无预览</span>
  </div>
</template>

<style scoped>
.asset-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
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

.asset-preview-audio-card {
  display: grid;
  place-items: center;
  gap: 4px;
  width: 64px;
  height: 52px;
  border: 1px solid #2d394b;
  border-radius: 6px;
  color: #8d9aab;
  background: #101722;
}

.asset-preview-audio-icon {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.asset-preview-audio-card span {
  font-size: 9px;
  font-weight: 700;
}

.asset-preview-empty {
  color: #909399;
  font-size: 12px;
}
</style>
