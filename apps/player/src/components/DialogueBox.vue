<script setup lang="ts">
/** 组件属性。 */
defineProps<{
  /** 当前说话人。 */
  speaker: string | null;
  /** 当前文本。 */
  text: string;
  /** 是否已经结束。 */
  isEnded: boolean;
}>();
</script>

<template>
  <section class="dialogue-box">
    <div class="speaker">{{ isEnded ? "结束" : speaker || "旁白" }}</div>
    <p>{{ isEnded ? "剧情已经结束。" : text }}</p>
  </section>
</template>
