<script setup lang="ts">
import { ref } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** 组件属性。 */
defineProps<{
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
}>();

/** 调试面板是否展开。 */
const expanded = ref(true);
</script>

<template>
  <aside class="debug-panel" :class="{ collapsed: !expanded }">
    <button type="button" class="debug-toggle" @click="expanded = !expanded">
      {{ expanded ? "收起调试" : "展开调试" }}
    </button>
    <div v-if="expanded" class="debug-content">
      <h2>Runtime Snapshot</h2>
      <dl>
        <dt>脚本</dt>
        <dd>{{ snapshot.currentScriptId }}</dd>
        <dt>节点</dt>
        <dd>{{ snapshot.currentNodeId || "结束" }}</dd>
        <dt>背景</dt>
        <dd>{{ snapshot.backgroundAssetId || "无" }}</dd>
        <dt>角色</dt>
        <dd><pre>{{ JSON.stringify(snapshot.characters, null, 2) }}</pre></dd>
        <dt>音频</dt>
        <dd><pre>{{ JSON.stringify(snapshot.audio, null, 2) }}</pre></dd>
        <dt>变量</dt>
        <dd><pre>{{ JSON.stringify(snapshot.variables, null, 2) }}</pre></dd>
      </dl>
    </div>
  </aside>
</template>
