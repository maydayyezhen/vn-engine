<script setup lang="ts">
import type { RuntimeSettings } from "@vn-engine/vn-ui-runtime";

/** 组件属性。 */
defineProps<{
  /** 当前运行时设置。 */
  settings: RuntimeSettings;
}>();

/** 组件事件。 */
defineEmits<{
  /** 关闭面板。 */
  close: [];
  /** 更新设置。 */
  update: [patch: Partial<RuntimeSettings>];
}>();
</script>

<template>
  <section class="runtime-overlay">
    <div class="panel-card settings-panel">
      <header class="panel-header">
        <h2>设置</h2>
        <button type="button" @click="$emit('close')">关闭</button>
      </header>

      <label class="setting-row">
        <span>主音量</span>
        <input type="range" min="0" max="1" step="0.01" :value="settings.masterVolume" @input="$emit('update', { masterVolume: Number(($event.target as HTMLInputElement).value) })" />
        <strong>{{ Math.round(settings.masterVolume * 100) }}%</strong>
      </label>
      <label class="setting-row">
        <span>BGM</span>
        <input type="range" min="0" max="1" step="0.01" :value="settings.bgmVolume" @input="$emit('update', { bgmVolume: Number(($event.target as HTMLInputElement).value) })" />
        <strong>{{ Math.round(settings.bgmVolume * 100) }}%</strong>
      </label>
      <label class="setting-row">
        <span>音效</span>
        <input type="range" min="0" max="1" step="0.01" :value="settings.soundVolume" @input="$emit('update', { soundVolume: Number(($event.target as HTMLInputElement).value) })" />
        <strong>{{ Math.round(settings.soundVolume * 100) }}%</strong>
      </label>
      <label class="setting-row">
        <span>语音</span>
        <input type="range" min="0" max="1" step="0.01" :value="settings.voiceVolume" @input="$emit('update', { voiceVolume: Number(($event.target as HTMLInputElement).value) })" />
        <strong>{{ Math.round(settings.voiceVolume * 100) }}%</strong>
      </label>

      <label class="setting-check">
        <input type="checkbox" :checked="settings.muted" @change="$emit('update', { muted: ($event.target as HTMLInputElement).checked })" />
        <span>静音</span>
      </label>
      <label class="setting-check">
        <input type="checkbox" :checked="settings.autoPlayEnabled" @change="$emit('update', { autoPlayEnabled: ($event.target as HTMLInputElement).checked })" />
        <span>自动播放</span>
      </label>
      <label class="setting-row">
        <span>自动间隔</span>
        <input type="number" min="300" max="10000" step="100" :value="settings.autoPlayDelayMs" @input="$emit('update', { autoPlayDelayMs: Number(($event.target as HTMLInputElement).value) })" />
        <strong>ms</strong>
      </label>
      <label class="setting-check">
        <input type="checkbox" :checked="settings.skipReadEnabled" @change="$emit('update', { skipReadEnabled: ($event.target as HTMLInputElement).checked })" />
        <span>允许快进已读</span>
      </label>
      <label class="setting-row">
        <span>文本速度</span>
        <input type="range" min="0.25" max="4" step="0.25" :value="settings.textSpeed" @input="$emit('update', { textSpeed: Number(($event.target as HTMLInputElement).value) })" />
        <strong>{{ settings.textSpeed }}x</strong>
      </label>
    </div>
  </section>
</template>
