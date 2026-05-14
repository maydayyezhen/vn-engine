<script setup lang="ts">
import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** 组件属性。 */
defineProps<{
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
}>();
</script>

<template>
  <section class="panel">
    <h2>Runtime Snapshot</h2>
    <dl>
      <dt>背景</dt>
      <dd>{{ snapshot.backgroundAssetId || "无" }}</dd>
      <dt>角色</dt>
      <dd>
        {{
          snapshot.characters.length
            ? snapshot.characters.map((item) => `${item.characterId}${item.expression ? `:${item.expression}` : ""}`).join(", ")
            : "无"
        }}
      </dd>
      <dt>脚本</dt>
      <dd>{{ snapshot.currentScriptId }}</dd>
      <dt>节点</dt>
      <dd>{{ snapshot.currentNodeId || "结束" }}</dd>
      <dt>变量</dt>
      <dd><pre>{{ JSON.stringify(snapshot.variables, null, 2) }}</pre></dd>
      <dt>音频</dt>
      <dd><pre>{{ JSON.stringify(snapshot.audio, null, 2) }}</pre></dd>
    </dl>
  </section>
</template>
