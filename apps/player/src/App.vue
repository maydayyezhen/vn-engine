<script setup lang="ts">
import { ref } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import ChoiceList from "./components/ChoiceList.vue";
import DialogueBox from "./components/DialogueBox.vue";
import SnapshotPanel from "./components/SnapshotPanel.vue";
import { createDemoRuntime } from "./runtime/createDemoRuntime";

/** demo 运行时实例。 */
const runtime = createDemoRuntime();
/** 当前运行时快照。 */
const snapshot = ref<RuntimeSnapshot>(runtime.getSnapshot());

/** 推进剧情。 */
function next(): void {
  snapshot.value = runtime.next();
}

/** 选择选项。 */
function choose(optionId: string): void {
  snapshot.value = runtime.choose(optionId);
}

/** 重启 demo。 */
function restart(): void {
  snapshot.value = runtime.start();
}
</script>

<template>
  <main class="player-shell">
    <section class="stage">
      <div class="background-path">背景：{{ snapshot.backgroundAssetId || "无" }}</div>
      <div class="character-layer">
        <div v-for="character in snapshot.characters" :key="character.characterId" class="character-card">
          <strong>{{ character.characterId }}</strong>
          <span>{{ character.assetId || "默认立绘" }}</span>
          <span>{{ character.position || "center" }}</span>
        </div>
      </div>
      <DialogueBox :speaker="snapshot.speaker" :text="snapshot.text" :is-ended="snapshot.isEnded" />
      <ChoiceList v-if="snapshot.type === 'choices'" :choices="snapshot.choices" @choose="choose" />
      <div class="actions">
        <button type="button" :disabled="snapshot.type === 'choices' || snapshot.isEnded" @click="next">下一步</button>
        <button type="button" @click="restart">重新开始</button>
      </div>
    </section>
    <SnapshotPanel :snapshot="snapshot" />
  </main>
</template>
