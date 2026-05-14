<script setup lang="ts">
/** 组件属性。 */
defineProps<{
  /** 自动播放是否开启。 */
  autoPlayEnabled: boolean;
  /** 快进已读是否开启。 */
  skipReadEnabled: boolean;
}>();

/** 组件事件。 */
defineEmits<{
  save: [];
  load: [];
  history: [];
  settings: [];
  menu: [];
  toggleAutoPlay: [];
  skipRead: [];
}>();
</script>

<template>
  <nav class="runtime-toolbar" aria-label="运行时工具栏" @click.stop>
    <button type="button" @click="$emit('save')">保存</button>
    <button type="button" @click="$emit('load')">读取</button>
    <button type="button" @click="$emit('history')">历史</button>
    <button type="button" @click="$emit('settings')">设置</button>
    <button type="button" :class="{ active: autoPlayEnabled }" @click="$emit('toggleAutoPlay')">自动</button>
    <button type="button" :disabled="!skipReadEnabled" @click="$emit('skipRead')">快进</button>
    <button type="button" @click="$emit('menu')">菜单</button>
  </nav>
</template>
