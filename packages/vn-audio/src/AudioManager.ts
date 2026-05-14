import type { AudioChannel } from "./AudioChannel";
import type { AudioManagerPlayOptions, AudioVolumeState } from "./types";

/** 浏览器 HTMLAudioElement 音频播放控制器。 */
export class AudioManager {
  /** 当前各通道音频元素。 */
  private readonly channels = new Map<AudioChannel, HTMLAudioElement>();
  /** 各通道当前素材 id。 */
  private readonly currentAssetIds = new Map<AudioChannel, string>();
  /** 音量状态。 */
  private volumeState: AudioVolumeState = {
    master: 0.8,
    bgm: 0.7,
    sound: 0.9,
    voice: 0.9,
    muted: false
  };

  /** 播放指定音频资源。 */
  async play(options: AudioManagerPlayOptions): Promise<void> {
    if (this.currentAssetIds.get(options.channel) === options.assetId) {
      return;
    }

    this.stop(options.channel);

    const audio = new Audio(options.path);
    audio.loop = Boolean(options.loop);
    audio.preload = "auto";
    this.applyVolume(options.channel, audio);

    this.channels.set(options.channel, audio);
    this.currentAssetIds.set(options.channel, options.assetId);

    try {
      await audio.play();
    } catch (error) {
      this.channels.delete(options.channel);
      this.currentAssetIds.delete(options.channel);
      throw new Error(error instanceof Error ? error.message : `音频播放失败：${options.assetId}`);
    }
  }

  /** 停止指定通道。 */
  stop(channel: AudioChannel): void {
    const audio = this.channels.get(channel);
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // 部分浏览器在未加载完成时不允许重置 currentTime，忽略即可。
    }
    this.channels.delete(channel);
    this.currentAssetIds.delete(channel);
  }

  /** 停止全部通道。 */
  stopAll(): void {
    for (const channel of ["bgm", "sound", "voice"] as AudioChannel[]) {
      this.stop(channel);
    }
  }

  /** 设置指定通道音量。 */
  setVolume(channel: AudioChannel, volume: number): void {
    this.volumeState = { ...this.volumeState, [channel]: this.clampVolume(volume) };
    const audio = this.channels.get(channel);
    if (audio) this.applyVolume(channel, audio);
  }

  /** 设置主音量。 */
  setMasterVolume(volume: number): void {
    this.volumeState = { ...this.volumeState, master: this.clampVolume(volume) };
    this.applyAllVolumes();
  }

  /** 设置静音状态。 */
  setMuted(muted: boolean): void {
    this.volumeState = { ...this.volumeState, muted };
    this.applyAllVolumes();
  }

  /** 获取当前音量状态。 */
  getVolumeState(): AudioVolumeState {
    return { ...this.volumeState };
  }

  /** 获取指定通道当前素材 id。 */
  getCurrentAssetId(channel: AudioChannel): string | undefined {
    return this.currentAssetIds.get(channel);
  }

  /** 销毁音频管理器。 */
  destroy(): void {
    this.stopAll();
  }

  /** 应用全部通道音量。 */
  private applyAllVolumes(): void {
    for (const [channel, audio] of this.channels.entries()) {
      this.applyVolume(channel, audio);
    }
  }

  /** 应用指定音频元素音量。 */
  private applyVolume(channel: AudioChannel, audio: HTMLAudioElement): void {
    audio.muted = this.volumeState.muted;
    audio.volume = this.clampVolume(this.volumeState.master * this.volumeState[channel]);
  }

  /** 将音量限制在 0 到 1。 */
  private clampVolume(volume: number): number {
    return Math.min(1, Math.max(0, volume));
  }
}
