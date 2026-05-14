<script setup lang="ts">
import { ref, shallowRef } from "vue";
import type { RuntimeSnapshot, VNRuntime } from "@vn-engine/vn-core";
import { usePlayerAudio } from "./audio/usePlayerAudio";
import AudioControlPanel from "./components/AudioControlPanel.vue";
import DebugSnapshotPanel from "./components/DebugSnapshotPanel.vue";
import GameStage from "./components/GameStage.vue";
import PlayerControls from "./components/PlayerControls.vue";
import { createDemoProject, createDemoRuntime } from "./runtime/createDemoRuntime";

/** 当前 demo 工程数据。 */
const project = createDemoProject();
/** 当前运行时实例。 */
const runtime = shallowRef<VNRuntime>(createDemoRuntime());
/** 当前运行时快照。 */
const snapshot = ref<RuntimeSnapshot>(runtime.value.getSnapshot());
/** 播放器音频同步状态。 */
const playerAudio = usePlayerAudio(project, snapshot);

/** 推进剧情。 */
function next(): void {
  if (snapshot.value.type === "choices" || snapshot.value.isEnded) return;
  snapshot.value = runtime.value.next();
}

/** 选择选项。 */
function choose(optionId: string): void {
  snapshot.value = runtime.value.choose(optionId);
}

/** 重新开始 demo。 */
function restart(): void {
  playerAudio.stopAll();
  runtime.value = createDemoRuntime();
  snapshot.value = runtime.value.getSnapshot();
}
</script>

<template>
  <main class="player-shell">
    <section class="player-main">
      <GameStage :project="project" :snapshot="snapshot" @choose="choose" />
      <PlayerControls :snapshot="snapshot" @next="next" @restart="restart" />
    </section>
    <section class="side-panels">
      <AudioControlPanel
        :resources="playerAudio.resources.value"
        :errors="playerAudio.errors.value"
        :master-volume="playerAudio.masterVolume.value"
        :muted="playerAudio.muted.value"
        @update-master-volume="playerAudio.setMasterVolume"
        @update-muted="playerAudio.setMuted"
      />
      <DebugSnapshotPanel
        :snapshot="snapshot"
        :audio-resources="playerAudio.resources.value"
        :audio-errors="playerAudio.errors.value"
      />
    </section>
  </main>
</template>
