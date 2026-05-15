<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AssetItem, AssetType, VNProject } from "@vn-engine/vn-schema";
import AssetPreview from "./AssetPreview.vue";
import { updateAsset } from "../services/assetEditService";
import { isAudioPreviewAsset, isImagePreviewAsset, resolveAssetPreviewUrl } from "../services/assetPreviewService";
import { isDesktopRuntime } from "../desktop/isDesktopRuntime";
import {
  copyDesktopAssetFile,
  selectDesktopAssetPath
} from "../desktop/desktopAssetBridge";

type AudioPlayer = HTMLAudioElement;

const props = defineProps<{
  project: VNProject;
  asset?: AssetItem;
}>();

const emit = defineEmits<{
  projectChange: [project: VNProject];
}>();

const assetTypes: AssetType[] = ["background", "character", "prop", "bgm", "sound", "sfx", "voice", "image", "other"];

const isSvgAsset = computed(() => /\b\.svg(?:\?|#|$)/i.test((props.asset?.path || "").trim()));
const previewUrl = computed(() => resolveAssetPreviewUrl(props.asset?.path));
const canPreviewImage = computed(() => !!props.asset && isImagePreviewAsset(props.asset) && !!previewUrl.value);
const isAudioAsset = computed(() => !!props.asset && isAudioPreviewAsset(props.asset));
const previewDialogVisible = ref(false);
const audioElement = ref<AudioPlayer | null>(null);
const isAudioPlaying = ref(false);
const audioCurrentTime = ref(0);
const audioDuration = ref(0);
const audioLoadError = ref(false);
const pathFileInput = ref<HTMLInputElement | null>(null);

function toMediaTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "--:--";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const displayDuration = computed(() => {
  return toMediaTime(audioDuration.value);
});

const audioCurrentTimeLabel = computed(() => toMediaTime(audioCurrentTime.value));
const canInteractAudio = computed(() => {
  return !!previewUrl.value && Number.isFinite(audioDuration.value) && audioDuration.value > 0 && !audioLoadError.value;
});
const audioProgressPercent = computed(() => {
  if (!canInteractAudio.value) return 0;
  const ratio = audioCurrentTime.value / audioDuration.value;
  if (ratio >= 0.9985) return 100;
  return Math.max(0, Math.min(100, Number((ratio * 100).toFixed(2))));
});

function handleAudioMetadata(event: Event): void {
  const el = event.target as HTMLAudioElement | null;
  const duration = el?.duration;
  if (typeof duration === "number" && Number.isFinite(duration)) {
    audioLoadError.value = false;
    audioDuration.value = duration;
    audioCurrentTime.value = 0;
  }
}

function handleAudioError(): void {
  audioLoadError.value = true;
  audioDuration.value = 0;
  isAudioPlaying.value = false;
  audioCurrentTime.value = 0;
}

function handleAudioTimeUpdate(event: Event): void {
  const el = event.target as HTMLAudioElement | null;
  if (!el) return;
  const currentTime = Number(el.currentTime || 0);
  const duration = el.duration;
  if (!Number.isFinite(currentTime)) return;

  if (Number.isFinite(duration) && duration > 0 && currentTime / duration >= 0.9985) {
    audioCurrentTime.value = duration;
    return;
  }

  audioCurrentTime.value = currentTime;
}

function handleAudioEnded(event: Event): void {
  const player = event.target as AudioPlayer | null;
  const fallbackDuration =
    Number.isFinite(player?.duration || Number.NaN) ? (player?.duration as number) : Number.isFinite(audioDuration.value) ? audioDuration.value : 0;

  isAudioPlaying.value = false;
  audioDuration.value = fallbackDuration;
  audioCurrentTime.value = fallbackDuration;

  if (player) {
    player.currentTime = fallbackDuration;
  }
}

function handleAudioSeek(event: Event): void {
  const input = event.target as HTMLInputElement | null;
  const player = audioElement.value;
  if (!input || !player) return;
  if (!canInteractAudio.value) return;
  const progress = Number(input.value);
  if (!Number.isFinite(progress)) return;

  const targetTime = audioDuration.value * (progress / 100);
  player.currentTime = Math.min(Math.max(0, targetTime), audioDuration.value);
  audioCurrentTime.value = targetTime;
}

async function toggleAudioPlayback(): Promise<void> {
  const player = audioElement.value;
  if (!player || !previewUrl.value) return;

  try {
    if (player.paused) {
      await player.play();
      isAudioPlaying.value = true;
    } else {
      player.pause();
      isAudioPlaying.value = false;
    }
  } catch {
    isAudioPlaying.value = false;
  }
}

function updateAudioPlayState(event: Event): void {
  const player = event.target as AudioPlayer | null;
  if (!player) return;
  isAudioPlaying.value = !player.paused;
}

function handleUpdateAsset(patch: Partial<AssetItem>): void {
  if (!props.asset) return;
  emit("projectChange", updateAsset(props.project, props.asset.id, patch));
}

async function openResourcePicker(): Promise<void> {
  if (!props.asset) return;

  if (isDesktopRuntime()) {
    const selected = await selectDesktopAssetPath(props.asset.type);
    if (!selected.ok || !selected.data) return;
    const copied = await copyDesktopAssetFile(selected.data, props.asset.type);
    if (!copied.ok || !copied.data) return;
    handleUpdateAsset({ path: copied.data.relative_path });
    return;
  }

  pathFileInput.value?.click();
}

function onResourceFilePick(event: Event): void {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  const pickedPath = (file as File & { path?: string }).path || file.name;
  handleUpdateAsset({ path: pickedPath });
  if (input) {
    input.value = "";
  }
}

function openImagePreview(): void {
  if (canPreviewImage.value && previewUrl.value) {
    previewDialogVisible.value = true;
  }
}

watch(
  () => props.asset?.id,
  () => {
    isAudioPlaying.value = false;
    audioCurrentTime.value = 0;
    audioDuration.value = 0;
    audioLoadError.value = false;

    const player = audioElement.value;
    if (!player) return;
    player.pause();
    player.currentTime = 0;
  }
);

watch(
  () => previewUrl.value,
  () => {
    isAudioPlaying.value = false;
    audioCurrentTime.value = 0;
    audioDuration.value = 0;
    audioLoadError.value = false;

    const player = audioElement.value;
    if (!player) return;
    player.pause();
    player.currentTime = 0;
  }
);
</script>

<template>
  <section class="resource-inspector-panel">
    <template v-if="asset">
      <div
        class="resource-inspector-preview"
        :class="{
          'resource-inspector-preview--background': asset.type === 'background',
          'resource-inspector-preview--audio': isAudioAsset,
          'is-previewable': canPreviewImage
        }"
      >
        <template v-if="isAudioAsset">
          <div class="asset-audio-preview">
            <div class="asset-audio-preview-top">
              <span class="asset-audio-preview-icon">♪</span>
              <span class="asset-audio-preview-name">{{ asset.name || asset.id }}</span>
              <span v-if="!previewUrl || audioLoadError" class="asset-audio-preview-missing">音频文件不存在</span>
            </div>
            <div class="asset-audio-preview-mini-player">
              <button
                type="button"
                class="asset-audio-preview-play-btn"
                :aria-label="isAudioPlaying ? '暂停' : '播放'"
                @click="toggleAudioPlayback"
              >
                {{ isAudioPlaying ? "❚❚" : "▶" }}
              </button>
              <span class="asset-audio-preview-time">{{ audioCurrentTimeLabel }}</span>
              <input
                type="range"
                class="asset-audio-preview-progress"
                min="0"
                max="100"
                step="0.1"
                :value="audioProgressPercent"
                :disabled="!canInteractAudio"
                @input="handleAudioSeek"
              />
              <span class="asset-audio-preview-duration">{{ displayDuration }}</span>
            </div>
            <audio
              v-if="previewUrl"
              ref="audioElement"
              class="asset-audio-preview-player"
              :src="previewUrl"
              preload="metadata"
              @loadedmetadata="handleAudioMetadata"
              @timeupdate="handleAudioTimeUpdate"
              @play="updateAudioPlayState"
              @pause="updateAudioPlayState"
              @ended="handleAudioEnded"
              @error="handleAudioError"
            />
            <div v-else class="asset-audio-preview-empty">无可用音频路径</div>
          </div>
        </template>
        <AssetPreview
          v-else
          :asset="asset"
          :variant="asset.type === 'character' ? 'portrait' : 'wide'"
          :class="['resource-inspector-asset-preview', { 'resource-inspector-asset-preview--svg': isSvgAsset }]"
          @click="openImagePreview"
        />
      </div>

      <el-form label-position="top" class="resource-inspector-form asset-inspector-form">
        <el-form-item label="素材ID">
          <el-input :model-value="asset.id" size="small" @change="(value: string) => handleUpdateAsset({ id: value })" />
        </el-form-item>
        <el-form-item label="素材名称">
          <el-input :model-value="asset.name" size="small" @update:model-value="(value: string) => handleUpdateAsset({ name: value })" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select :model-value="asset.type" size="small" @update:model-value="(value: AssetType) => handleUpdateAsset({ type: value })">
            <el-option v-for="type in assetTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" class="asset-inspector-form-full">
          <input
            ref="pathFileInput"
            type="file"
            class="asset-inspector-hidden-file-input"
            @change="onResourceFilePick"
          />
          <el-input
            :model-value="asset.path"
            size="small"
            class="asset-inspector-path-input"
            @update:model-value="(value: string) => handleUpdateAsset({ path: value })"
          >
            <template #append>
              <button
                type="button"
                class="asset-inspector-path-picker-btn"
                @click="openResourcePicker"
                title="选择资源"
                aria-label="选择资源"
              >
                <span class="asset-inspector-path-picker-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                    <path
                      d="M4 5h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="说明" class="asset-inspector-form-full">
          <el-input
            :model-value="asset.description"
            class="panel-long-textarea"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 12 }"
            @update:model-value="(value: string) => handleUpdateAsset({ description: value })"
          />
        </el-form-item>
      </el-form>
      <el-dialog
        v-model="previewDialogVisible"
        :show-close="false"
        width="min(1100px, calc(100vw - 64px))"
        :modal-style="{ backgroundColor: 'rgba(4, 8, 14, 0.82)' }"
        custom-class="asset-inspector-image-preview-dialog"
        :append-to-body="true"
        modal-class="asset-inspector-image-preview-modal"
        class="asset-inspector-image-preview-dialog"
      >
        <div class="asset-inspector-image-preview-body">
          <div class="asset-inspector-image-preview-title">{{ asset.name || asset.id }}</div>
          <button
            type="button"
            class="asset-inspector-image-preview-close"
            @click="previewDialogVisible = false"
            aria-label="关闭预览"
          >
            ×
          </button>
          <img v-if="previewUrl" :src="previewUrl" :alt="asset.name || asset.id" class="asset-inspector-image-preview-image" />
        </div>
      </el-dialog>
    </template>
    <div v-else class="inspector-empty-state">
      <strong>未选择素材</strong>
      <span>请先在左侧资源列表里选中具体素材后再编辑。</span>
    </div>
  </section>
</template>
