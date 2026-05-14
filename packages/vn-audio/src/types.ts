import type { AssetItem } from "@vn-engine/vn-schema";
import type { AudioChannel } from "./AudioChannel";

/** 音频播放参数。 */
export interface AudioManagerPlayOptions {
  /** 音频通道。 */
  channel: AudioChannel;
  /** 音频素材 id。 */
  assetId: string;
  /** 音频资源路径。 */
  path: string;
  /** 是否循环播放。 */
  loop?: boolean;
}

/** 音频音量状态。 */
export interface AudioVolumeState {
  /** 主音量，范围 0 到 1。 */
  master: number;
  /** BGM 音量，范围 0 到 1。 */
  bgm: number;
  /** 音效音量，范围 0 到 1。 */
  sound: number;
  /** 语音音量，范围 0 到 1。 */
  voice: number;
  /** 是否静音。 */
  muted: boolean;
}

/** 音频播放或解析错误。 */
export interface AudioPlaybackError {
  /** 出错通道。 */
  channel: AudioChannel;
  /** 出错素材 id。 */
  assetId?: string;
  /** 错误信息。 */
  message: string;
}

/** 解析后的音频资源。 */
export interface AudioResolvedResource {
  /** 音频通道。 */
  channel: AudioChannel;
  /** 音频素材 id。 */
  assetId?: string;
  /** 音频显示名称。 */
  name: string;
  /** 音频路径。 */
  path?: string;
  /** 原始素材。 */
  asset?: AssetItem;
  /** 解析是否成功。 */
  ok: boolean;
  /** 失败原因。 */
  error?: string;
}

/** 音频状态同步结果。 */
export interface AudioStateSyncResult {
  /** 当前解析到的音频资源。 */
  resources: AudioResolvedResource[];
  /** 同步过程中产生的错误。 */
  errors: AudioPlaybackError[];
}
