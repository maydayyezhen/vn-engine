<script setup lang="ts">
import { ref } from "vue";
import type { AudioPlaybackError, AudioResolvedResource } from "@vn-engine/vn-audio";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** 组件属性。 */
defineProps<{
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
  /** 当前解析到的音频资源。 */
  audioResources: AudioResolvedResource[];
  /** 当前音频错误。 */
  audioErrors: AudioPlaybackError[];
  /** 当前项目来源。 */
  projectSource?: "external" | "demo";
  /** 外部项目加载失败信息。 */
  projectLoadMessage?: string | null;
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
        <dt>项目来源</dt>
        <dd>{{ projectSource === "external" ? "外部项目包" : "内置 demo" }}</dd>
        <dt v-if="projectLoadMessage">加载提示</dt>
        <dd v-if="projectLoadMessage">{{ projectLoadMessage }}</dd>
        <dt>节点</dt>
        <dd>{{ snapshot.currentNodeId || "结束" }}</dd>
        <dt>背景</dt>
        <dd>{{ snapshot.backgroundAssetId || "无" }}</dd>
        <dt>角色</dt>
        <dd><pre>{{ JSON.stringify(snapshot.characters, null, 2) }}</pre></dd>
        <dt>物品</dt>
        <dd><pre>{{ JSON.stringify(snapshot.props, null, 2) }}</pre></dd>
        <dt>音频状态</dt>
        <dd><pre>{{ JSON.stringify(snapshot.audio, null, 2) }}</pre></dd>
        <dt>音频资源</dt>
        <dd><pre>{{ JSON.stringify(audioResources, null, 2) }}</pre></dd>
        <dt>音频错误</dt>
        <dd><pre>{{ JSON.stringify(audioErrors, null, 2) }}</pre></dd>
        <dt>变量</dt>
        <dd><pre>{{ JSON.stringify(snapshot.variables, null, 2) }}</pre></dd>
        <dt>逻辑日志</dt>
        <dd><pre>{{ JSON.stringify(snapshot.debugLog.slice(-10), null, 2) }}</pre></dd>
      </dl>
    </div>
  </aside>
</template>
