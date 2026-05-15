<script setup lang="ts">
/** 中央主工作区组件。 */
</script>

<template>
  <section class="center-stage">
    <slot name="tabs" />
    <slot name="visual" />
    <slot name="dock" />
  </section>
</template>
