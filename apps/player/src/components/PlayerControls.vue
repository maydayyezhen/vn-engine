<script setup lang="ts">
import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** 组件属性。 */
defineProps<{
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
}>();

/** 组件事件。 */
defineEmits<{
  /** 推进剧情。 */
  next: [];
  /** 重新开始剧情。 */
  restart: [];
}>();
</script>

<template>
  <section class="player-controls" aria-label="播放器控制">
    <button type="button" :disabled="snapshot.type === 'choices' || snapshot.isEnded" @click="$emit('next')">下一步</button>
    <button type="button" @click="$emit('restart')">{{ snapshot.isEnded ? "重新开始" : "重新开始" }}</button>
    <span v-if="snapshot.type === 'choices'" class="control-hint">请选择一个选项继续</span>
    <span v-else-if="snapshot.isEnded" class="control-hint">剧情已结束</span>
  </section>
</template>
