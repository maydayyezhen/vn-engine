<script setup lang="ts">
/** 组件事件。 */
defineEmits<{
  /** 开始新游戏。 */
  start: [];
  /** 打开读取存档面板。 */
  load: [];
  /** 打开设置面板。 */
  settings: [];
}>();
</script>

<template>
  <section class="runtime-overlay title-menu">
    <div class="menu-card title-card">
      <p class="menu-kicker">VN Engine Demo</p>
      <h1>测试视觉小说</h1>
      <div class="menu-actions">
        <button type="button" @click="$emit('start')">开始游戏</button>
        <button type="button" @click="$emit('load')">读取存档</button>
        <button type="button" @click="$emit('settings')">设置</button>
      </div>
    </div>
  </section>
</template>
