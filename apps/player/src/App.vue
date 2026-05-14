<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import type { RuntimeSnapshot, VNRuntime } from "@vn-engine/vn-core";
import { VNRuntime as Runtime } from "@vn-engine/vn-core";
import type { RuntimeSettings } from "@vn-engine/vn-ui-runtime";
import { usePlayerAudio } from "./audio/usePlayerAudio";
import GameStage from "./components/GameStage.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import PauseMenu from "./components/PauseMenu.vue";
import RuntimeToolbar from "./components/RuntimeToolbar.vue";
import SaveLoadPanel from "./components/SaveLoadPanel.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import StartMenu from "./components/StartMenu.vue";
import { loadPlayerProject } from "./project/loadPlayerProject";
import { createDemoProject } from "./runtime/createDemoRuntime";
import { useAutoPlay } from "./ui/useAutoPlay";
import { usePlayerHistory } from "./ui/usePlayerHistory";
import { usePlayerSaves } from "./ui/usePlayerSaves";
import { usePlayerSettings } from "./ui/usePlayerSettings";
import { useSkipRead } from "./ui/useSkipRead";

/** 播放器页面状态。 */
type GameMode = "title" | "playing";
/** 当前打开的运行时面板。 */
type ActivePanel = null | "pause" | "save" | "load" | "history" | "settings";

/** 当前播放器工程数据。 */
const project = shallowRef(createDemoProject());
/** 当前运行时实例。 */
const runtime = shallowRef<VNRuntime>(new Runtime(project.value));
/** 当前运行时快照。 */
const snapshot = ref<RuntimeSnapshot>(runtime.value.getSnapshot());
/** 当前播放器模式。 */
const gameMode = ref<GameMode>("title");
/** 当前打开的面板。 */
const activePanel = ref<ActivePanel>(null);
/** 存读档面板模式。 */
const savePanelMode = ref<"save" | "load">("load");
/** 当前子面板关闭后要回到的面板。 */
const panelCloseTarget = ref<ActivePanel>(null);
/** 当前项目 id。 */
const projectId = computed(() => project.value.id);

/** 播放器音频同步状态。 */
const playerAudio = usePlayerAudio(project, snapshot);
/** 本地存档状态。 */
const playerSaves = usePlayerSaves(window.localStorage, projectId);
/** 当前游玩历史。 */
const playerHistory = usePlayerHistory();
/** 本地运行时设置。 */
const playerSettings = usePlayerSettings(window.localStorage, projectId);
/** 已读节点和快进判断。 */
const skipRead = useSkipRead(window.localStorage);
/** 自动播放延迟。 */
const autoPlayDelay = computed(() => playerSettings.settings.value.autoPlayDelayMs);
/** 自动播放控制。 */
const autoPlay = useAutoPlay(snapshot, autoPlayDelay, () => next());
/** 页面 class。 */
const shellClass = computed(() => ({
  "is-title": gameMode.value === "title"
}));
/** 动作序列完成兜底计时器，避免渲染回调丢失时卡在 action snapshot。 */
let actionCompletionFallbackTimer: ReturnType<typeof setTimeout> | null = null;

/** 应用设置到音频管理器。 */
function applyAudioSettings(settings: RuntimeSettings): void {
  playerAudio.setMasterVolume(settings.masterVolume);
  playerAudio.setChannelVolume("bgm", settings.bgmVolume);
  playerAudio.setChannelVolume("sound", settings.soundVolume);
  playerAudio.setChannelVolume("voice", settings.voiceVolume);
  playerAudio.setMuted(settings.muted);
}

/** 进入新游戏。 */
function startNewGame(): void {
  playerAudio.stopAll();
  runtime.value = new Runtime(project.value);
  runtime.value.start();
  gameMode.value = "playing";
  activePanel.value = null;
  snapshot.value = runtime.value.getSnapshot();
  scheduleActionCompletionFallback(snapshot.value);
  playerHistory.clear();
  applyAudioSettings(playerSettings.settings.value);
  autoPlay.setEnabled(playerSettings.settings.value.autoPlayEnabled);
}

/** 推进剧情。 */
function next(): void {
  if (gameMode.value !== "playing") return;
  if (snapshot.value.isWaitingForActionCompletion) return;
  if (snapshot.value.type === "choices" || snapshot.value.isEnded) return;
  snapshot.value = runtime.value.next();
}

/** 渲染器通知动作序列完成后继续推进剧情。 */
function handleActionSequenceComplete(): void {
  if (gameMode.value !== "playing") return;
  if (!snapshot.value.isWaitingForActionCompletion) return;
  clearActionCompletionFallback();
  snapshot.value = runtime.value.next();
}

/** 清理动作序列兜底计时器。 */
function clearActionCompletionFallback(): void {
  if (!actionCompletionFallbackTimer) return;
  clearTimeout(actionCompletionFallbackTimer);
  actionCompletionFallbackTimer = null;
}

/** 根据 pendingActions 估算兜底等待时长。 */
function getActionFallbackDelay(value: RuntimeSnapshot): number {
  const total = (value.pendingActions ?? []).reduce((sum, action) => {
    const fallbackDuration = action.actionType === "wait" ? 500 : 300;
    return sum + Math.max(0, action.durationMs ?? fallbackDuration);
  }, 0);
  return Math.min(Math.max(total + 800, 1200), 8000);
}

/** 如果渲染器完成回调丢失，按动作时长兜底推进剧情。 */
function scheduleActionCompletionFallback(value: RuntimeSnapshot): void {
  clearActionCompletionFallback();
  if (gameMode.value !== "playing" || !value.isWaitingForActionCompletion) return;
  actionCompletionFallbackTimer = setTimeout(() => {
    if (gameMode.value !== "playing" || !snapshot.value.isWaitingForActionCompletion) return;
    snapshot.value = runtime.value.next();
  }, getActionFallbackDelay(value));
}

/** 选择选项。 */
function choose(optionId: string): void {
  if (gameMode.value !== "playing") return;
  const option = snapshot.value.choices.find((item) => item.id === optionId);
  if (option) playerHistory.pushChoice(snapshot.value, option.text);
  autoPlay.setEnabled(false);
  playerSettings.updateSettings({ autoPlayEnabled: false });
  snapshot.value = runtime.value.choose(optionId);
}

/** 点击舞台推进剧情；选项和结局状态由舞台内 UI 处理。 */
function handleStageClick(): void {
  if (gameMode.value !== "playing" || activePanel.value) return;
  if (snapshot.value.isWaitingForActionCompletion) return;
  if (snapshot.value.type === "choices" || snapshot.value.isEnded) return;
  next();
}

/** 重新开始当前剧情。 */
function restart(): void {
  startNewGame();
}

/** 返回标题菜单。 */
function returnToTitle(): void {
  autoPlay.setEnabled(false);
  playerAudio.stopAll();
  runtime.value = new Runtime(project.value);
  snapshot.value = runtime.value.getSnapshot();
  gameMode.value = "title";
  activePanel.value = null;
}

/** 打开保存面板。 */
function openSavePanel(closeTarget: ActivePanel = null): void {
  savePanelMode.value = "save";
  panelCloseTarget.value = closeTarget;
  activePanel.value = "save";
}

/** 打开读取面板。 */
function openLoadPanel(closeTarget: ActivePanel = null): void {
  savePanelMode.value = "load";
  panelCloseTarget.value = closeTarget;
  activePanel.value = "load";
}

/** 打开历史面板。 */
function openHistoryPanel(closeTarget: ActivePanel = null): void {
  panelCloseTarget.value = closeTarget;
  activePanel.value = "history";
}

/** 打开设置面板。 */
function openSettingsPanel(closeTarget: ActivePanel = null): void {
  panelCloseTarget.value = closeTarget;
  activePanel.value = "settings";
}

/** 关闭当前子面板并回到打开它的位置。 */
function closeChildPanel(): void {
  activePanel.value = panelCloseTarget.value;
  panelCloseTarget.value = null;
}

/** 保存到指定槽位。 */
function saveToSlot(slotId: string): void {
  if (gameMode.value !== "playing") return;
  playerSaves.saveCurrent(slotId, snapshot.value, runtime.value.getState());
  closeChildPanel();
}

/** 从指定槽位读档。 */
function loadFromSlot(slotId: string): void {
  const slot = playerSaves.load(slotId);
  if (!slot) return;
  playerAudio.stopAll();
  if (slot.projectId !== project.value.id) return;
  runtime.value = new Runtime(project.value);
  snapshot.value = runtime.value.loadState(slot.state);
  gameMode.value = "playing";
  activePanel.value = null;
  applyAudioSettings(playerSettings.settings.value);
  autoPlay.setEnabled(false);
}

/** 删除指定槽位。 */
function removeSave(slotId: string): void {
  playerSaves.remove(slotId);
}

/** 更新设置并同步到音频和自动播放。 */
function updateSettings(patch: Partial<RuntimeSettings>): void {
  playerSettings.updateSettings(patch);
  applyAudioSettings(playerSettings.settings.value);
  if (patch.autoPlayEnabled !== undefined) {
    autoPlay.setEnabled(patch.autoPlayEnabled && gameMode.value === "playing");
  }
}

/** 切换自动播放。 */
function toggleAutoPlay(): void {
  const enabled = !autoPlay.enabled.value;
  updateSettings({ autoPlayEnabled: enabled });
  autoPlay.setEnabled(enabled && gameMode.value === "playing");
}

/** 快进已读节点的最小实现。 */
function skipReadNodes(): void {
  if (!playerSettings.settings.value.skipReadEnabled || gameMode.value !== "playing") return;
  let count = 0;
  while (skipRead.canSkip(snapshot.value) && count < 100) {
    snapshot.value = runtime.value.next();
    count += 1;
  }
}

watch(
  snapshot,
  (value) => {
    if (gameMode.value !== "playing") return;
    playerHistory.pushSnapshot(value);
    skipRead.markRead(value);
    scheduleActionCompletionFallback(value);
  },
  { immediate: false }
);

watch(
  playerSettings.settings,
  (value) => {
    applyAudioSettings(value);
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  const result = await loadPlayerProject();
  project.value = result.project;
  runtime.value = new Runtime(project.value);
  snapshot.value = runtime.value.getSnapshot();
  applyAudioSettings(playerSettings.settings.value);
});

onBeforeUnmount(() => {
  clearActionCompletionFallback();
});
</script>

<template>
  <main class="player-shell" :class="shellClass">
    <aside class="landscape-notice" aria-label="横屏提示">
      <div>
        <strong>请横屏游玩</strong>
        <p>手机竖屏空间不足，横屏后可以完整显示背景、人物和对话框。</p>
      </div>
    </aside>
    <section v-if="gameMode === 'playing'" class="player-main">
      <div class="stage-frame" @click="handleStageClick">
        <GameStage
          :project="project"
          :snapshot="snapshot"
          :ui-hidden="false"
          @choose="choose"
          @action-sequence-complete="handleActionSequenceComplete"
        />
        <RuntimeToolbar
          v-if="gameMode === 'playing'"
          :auto-play-enabled="autoPlay.enabled.value"
          :skip-read-enabled="playerSettings.settings.value.skipReadEnabled"
          @save="openSavePanel"
          @load="openLoadPanel"
          @history="openHistoryPanel"
          @settings="openSettingsPanel"
          @menu="activePanel = 'pause'"
          @toggle-auto-play="toggleAutoPlay"
          @skip-read="skipReadNodes"
        />
      </div>
    </section>

    <StartMenu v-if="gameMode === 'title' && !activePanel" @start="startNewGame" @load="openLoadPanel" @settings="openSettingsPanel" />
    <PauseMenu
      v-if="activePanel === 'pause'"
      @resume="activePanel = null"
      @save="openSavePanel('pause')"
      @load="openLoadPanel('pause')"
      @history="openHistoryPanel('pause')"
      @settings="openSettingsPanel('pause')"
      @restart="restart"
      @title="returnToTitle"
    />
    <SaveLoadPanel
      v-if="activePanel === 'save' || activePanel === 'load'"
      :mode="savePanelMode"
      :slot-ids="playerSaves.slotIds"
      :saves="playerSaves.saves.value"
      @close="closeChildPanel"
      @save="saveToSlot"
      @load="loadFromSlot"
      @remove="removeSave"
    />
    <HistoryPanel v-if="activePanel === 'history'" :entries="playerHistory.entries.value" @close="closeChildPanel" @clear="playerHistory.clear" />
    <SettingsPanel
      v-if="activePanel === 'settings'"
      :settings="playerSettings.settings.value"
      @close="closeChildPanel"
      @update="updateSettings"
    />
  </main>
</template>
