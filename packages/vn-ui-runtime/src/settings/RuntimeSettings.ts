/** 播放器运行时设置。 */
export interface RuntimeSettings {
  /** 主音量，范围 0 到 1。 */
  masterVolume: number;
  /** BGM 音量，范围 0 到 1。 */
  bgmVolume: number;
  /** 音效音量，范围 0 到 1。 */
  soundVolume: number;
  /** 语音音量，范围 0 到 1。 */
  voiceVolume: number;
  /** 是否静音。 */
  muted: boolean;
  /** 是否开启自动播放。 */
  autoPlayEnabled: boolean;
  /** 自动播放间隔毫秒数。 */
  autoPlayDelayMs: number;
  /** 是否开启快进已读。 */
  skipReadEnabled: boolean;
  /** 文本速度设置，本轮先作为持久化设置项。 */
  textSpeed: number;
}
