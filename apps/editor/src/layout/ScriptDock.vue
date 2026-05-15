<script setup lang="ts">
import type { EditorView } from "../stores/editorStore";
import type { ScriptDockTab } from "../stores/layoutStore";

defineProps<{
  /** 当前编辑器视图 */
  activeView: EditorView;
  /** 当前编辑器下方脚本区标签 */
  activeTab: ScriptDockTab;
}>();

const emit = defineEmits<{
  updateActiveTab: [tab: ScriptDockTab];
}>();

const tabLabels: Record<ScriptDockTab, string> = {
  script: "\u811a\u672c\u7f16\u8f91",
  branch: "\u5206\u652f\u89c6\u56fe",
  timeline: "\u65f6\u95f4\u7ebf",
  animation: "\u52a8\u753b\u7f16\u8f91"
};
</script>

<template>
  <section class="script-dock">
    <div class="dock-tabs">
      <button
        type="button"
        :class="{ active: activeTab === 'script' }"
        :title="tabLabels.script"
        @click="$emit('updateActiveTab', 'script')"
      >
        {{ tabLabels.script }}
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'branch' }"
        :title="tabLabels.branch"
        @click="$emit('updateActiveTab', 'branch')"
      >
        {{ tabLabels.branch }}
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'timeline' }"
        :title="tabLabels.timeline"
        @click="$emit('updateActiveTab', 'timeline')"
      >
        {{ tabLabels.timeline }}
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'animation' }"
        :title="tabLabels.animation"
        @click="$emit('updateActiveTab', 'animation')"
      >
        {{ tabLabels.animation }}
      </button>
    </div>
    <div class="dock-content">
      <slot v-if="activeTab === 'script'" name="script" />
      <slot v-else-if="activeTab === 'branch'" name="branch" />
      <slot v-else-if="activeTab === 'timeline'" name="timeline" />
      <slot v-else-if="activeTab === 'animation'" name="animation" />
    </div>
  </section>
</template>
