<script setup lang="ts">
import type { HistoryEntry } from "@vn-engine/vn-ui-runtime";

/** 组件属性。 */
defineProps<{
  /** 历史记录列表。 */
  entries: HistoryEntry[];
}>();

/** 组件事件。 */
defineEmits<{
  /** 关闭面板。 */
  close: [];
  /** 清空历史。 */
  clear: [];
}>();
</script>

<template>
  <section class="runtime-overlay">
    <div class="panel-card history-panel">
      <header class="panel-header">
        <h2>历史记录</h2>
        <div>
          <button type="button" @click="$emit('clear')">清空</button>
          <button type="button" @click="$emit('close')">关闭</button>
        </div>
      </header>

      <div v-if="entries.length" class="history-list">
        <article v-for="entry in entries" :key="entry.id" class="history-entry">
          <strong>{{ entry.speakerName || "旁白" }}</strong>
          <p>{{ entry.text }}</p>
        </article>
      </div>
      <p v-else class="empty-panel">暂无历史记录</p>
    </div>
  </section>
</template>
