<script setup lang="ts">
/** 组件事件。 */
defineEmits<{
  /** 继续游戏。 */
  resume: [];
  /** 打开保存面板。 */
  save: [];
  /** 打开读取面板。 */
  load: [];
  /** 打开历史面板。 */
  history: [];
  /** 打开设置面板。 */
  settings: [];
  /** 重新开始当前剧情。 */
  restart: [];
  /** 返回标题菜单。 */
  title: [];
}>();
</script>

<template>
  <section class="runtime-overlay">
    <div class="menu-card pause-card">
      <h2>暂停</h2>
      <div class="menu-actions">
        <button type="button" @click="$emit('resume')">继续游戏</button>
        <button type="button" @click="$emit('save')">保存</button>
        <button type="button" @click="$emit('load')">读取</button>
        <button type="button" @click="$emit('history')">历史</button>
        <button type="button" @click="$emit('settings')">设置</button>
        <button type="button" @click="$emit('restart')">重新开始</button>
        <button type="button" @click="$emit('title')">返回标题</button>
      </div>
    </div>
  </section>
</template>
