<script setup lang="ts">
/** 工作台外壳组件，负责统一放置菜单、工具栏、资源区、主工作区、检查器和状态栏。 */
</script>

<template>
  <div class="editor-workbench">
    <header class="workbench-menu">
      <slot name="menu" />
    </header>
    <header class="workbench-toolbar">
      <slot name="toolbar" />
    </header>
    <section class="workbench-body">
      <aside class="workbench-explorer">
        <slot name="explorer" />
      </aside>
      <main class="workbench-center">
        <slot name="center" />
      </main>
      <aside class="workbench-inspector">
        <slot name="inspector" />
      </aside>
    </section>
    <footer class="workbench-statusbar">
      <slot name="statusbar" />
    </footer>
  </div>
</template>
