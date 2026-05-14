import type { VariableValue } from "@vn-engine/vn-schema";

/** 当前显示的角色状态。 */
export interface RuntimeCharacterDisplay {
  /** 角色 id。 */
  characterId: string;
  /** 当前立绘素材 id。 */
  assetId?: string;
  /** 角色画面位置。 */
  position?: "left" | "center" | "right";
}

/** 当前播放的音频状态。 */
export interface RuntimeAudioState {
  /** 当前 BGM 素材 id。 */
  bgm?: string;
  /** 当前音效素材 id。 */
  sfx?: string;
  /** 当前语音素材 id。 */
  voice?: string;
}

/** 可保存和恢复的运行时状态。 */
export interface RuntimeState {
  /** 当前脚本 id。 */
  currentScriptId: string;
  /** 当前节点 id。 */
  currentNodeId: string | null;
  /** 当前节点在脚本中的下标。 */
  currentNodeIndex: number;
  /** 当前背景素材 id。 */
  backgroundAssetId?: string;
  /** 当前显示的角色列表。 */
  characters: RuntimeCharacterDisplay[];
  /** 当前音频状态。 */
  audio: RuntimeAudioState;
  /** 当前变量表。 */
  variables: Record<string, VariableValue>;
  /** 运行时是否正在等待玩家选择。 */
  isWaitingChoice: boolean;
  /** 剧情是否已经结束。 */
  isEnded: boolean;
}
