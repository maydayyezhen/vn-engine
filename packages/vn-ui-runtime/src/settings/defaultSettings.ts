import type { RuntimeSettings } from "./RuntimeSettings";

/** 默认播放器运行时设置。 */
export const defaultRuntimeSettings: RuntimeSettings = {
  masterVolume: 0.8,
  bgmVolume: 1,
  soundVolume: 1,
  voiceVolume: 1,
  muted: false,
  autoPlayEnabled: false,
  autoPlayDelayMs: 1800,
  skipReadEnabled: false,
  textSpeed: 1
};
