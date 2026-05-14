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
  /** BGM 音量。 */
  bgmVolume?: number;
  /** 音效音量。 */
  soundVolume?: number;
  /** 语音音量。 */
  voiceVolume?: number;
}>();

/** 组件事件。 */
defineEmits<{
  /** 更新主音量。 */
  updateMasterVolume: [volume: number];
  /** 更新静音状态。 */
  updateMuted: [muted: boolean];
  /** 更新 BGM 音量。 */
  updateBgmVolume: [volume: number];
  /** 更新音效音量。 */
  updateSoundVolume: [volume: number];
  /** 更新语音音量。 */
  updateVoiceVolume: [volume: number];
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

    <label v-if="bgmVolume !== undefined" class="audio-control-row">
      <span>BGM</span>
      <input type="range" min="0" max="1" step="0.01" :value="bgmVolume" @input="$emit('updateBgmVolume', Number(($event.target as HTMLInputElement).value))" />
      <strong>{{ Math.round(bgmVolume * 100) }}%</strong>
    </label>

    <label v-if="soundVolume !== undefined" class="audio-control-row">
      <span>音效</span>
      <input type="range" min="0" max="1" step="0.01" :value="soundVolume" @input="$emit('updateSoundVolume', Number(($event.target as HTMLInputElement).value))" />
      <strong>{{ Math.round(soundVolume * 100) }}%</strong>
    </label>

    <label v-if="voiceVolume !== undefined" class="audio-control-row">
      <span>语音</span>
      <input type="range" min="0" max="1" step="0.01" :value="voiceVolume" @input="$emit('updateVoiceVolume', Number(($event.target as HTMLInputElement).value))" />
      <strong>{{ Math.round(voiceVolume * 100) }}%</strong>
    </label>

    <div v-if="errors.length" class="audio-errors">
      <strong>音频提示</strong>
      <p v-for="error in errors" :key="`${error.channel}-${error.assetId}-${error.message}`">
        {{ error.channel }}：{{ error.message }}
      </p>
    </div>
  </section>
</template>
