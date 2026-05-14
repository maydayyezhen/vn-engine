<script setup lang="ts">
import type { AudioPlaybackError, AudioResolvedResource } from "@vn-engine/vn-audio";
import { getAudioDisplayName } from "../audio/playerAudioBridge";

/** 组件属性。 */
defineProps<{
  /** 当前解析到的音频资源。 */
  resources: AudioResolvedResource[];
  /** 音频错误列表。 */
  errors: AudioPlaybackError[];
  /** 主音量。 */
  masterVolume: number;
  /** 是否静音。 */
  muted: boolean;
}>();

/** 组件事件。 */
defineEmits<{
  /** 更新主音量。 */
  updateMasterVolume: [volume: number];
  /** 更新静音状态。 */
  updateMuted: [muted: boolean];
}>();
</script>

<template>
  <section class="audio-panel">
    <h2>音频控制</h2>
    <dl>
      <dt>BGM</dt>
      <dd>{{ getAudioDisplayName(resources, "bgm") }}</dd>
      <dt>音效</dt>
      <dd>{{ getAudioDisplayName(resources, "sound") }}</dd>
      <dt>语音</dt>
      <dd>{{ getAudioDisplayName(resources, "voice") }}</dd>
    </dl>

    <label class="audio-control-row">
      <span>主音量</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="masterVolume"
        @input="$emit('updateMasterVolume', Number(($event.target as HTMLInputElement).value))"
      />
      <strong>{{ Math.round(masterVolume * 100) }}%</strong>
    </label>

    <label class="audio-checkbox-row">
      <input type="checkbox" :checked="muted" @change="$emit('updateMuted', ($event.target as HTMLInputElement).checked)" />
      <span>静音</span>
    </label>

    <div v-if="errors.length" class="audio-errors">
      <strong>音频提示</strong>
      <p v-for="error in errors" :key="`${error.channel}-${error.assetId}-${error.message}`">
        {{ error.channel }}：{{ error.message }}
      </p>
    </div>
  </section>
</template>
