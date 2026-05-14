import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import { AudioManager, resolveAudioState, syncAudioState, type AudioPlaybackError, type AudioResolvedResource } from "@vn-engine/vn-audio";
import type { AudioChannel } from "@vn-engine/vn-audio";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";

/** 创建播放器音频同步逻辑。 */
export function usePlayerAudio(project: Ref<VNProject>, snapshot: Ref<RuntimeSnapshot>) {
  /** 浏览器音频管理器。 */
  const audioManager = new AudioManager();
  /** 主音量。 */
  const masterVolume = ref(audioManager.getVolumeState().master);
  /** 是否静音。 */
  const muted = ref(audioManager.getVolumeState().muted);
  /** 当前解析到的音频资源。 */
  const resources = ref<AudioResolvedResource[]>(resolveAudioState(snapshot.value, project.value));
  /** 当前音频错误。 */
  const errors = ref<AudioPlaybackError[]>([]);

  /** 同步当前运行时快照中的音频状态。 */
  async function sync(): Promise<void> {
    const result = await syncAudioState(snapshot.value, project.value, audioManager);
    resources.value = result.resources;
    errors.value = result.errors;
  }

  /** 设置主音量。 */
  function setMasterVolume(value: number): void {
    masterVolume.value = value;
    audioManager.setMasterVolume(value);
  }

  /** 设置指定音频通道音量。 */
  function setChannelVolume(channel: AudioChannel, value: number): void {
    audioManager.setVolume(channel, value);
  }

  /** 设置静音状态。 */
  function setMuted(value: boolean): void {
    muted.value = value;
    audioManager.setMuted(value);
  }

  /** 停止全部音频。 */
  function stopAll(): void {
    audioManager.stopAll();
  }

  watch([snapshot, project], () => {
    void sync();
  }, { immediate: true });

  onBeforeUnmount(() => {
    audioManager.destroy();
  });

  return {
    resources,
    errors,
    masterVolume,
    muted,
    sync,
    setMasterVolume,
    setChannelVolume,
    setMuted,
    stopAll
  };
}
