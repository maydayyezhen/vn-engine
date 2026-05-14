import type { CharacterEnterEffect, CharacterExitEffect, CharacterPosition, TransitionType, VariableValue } from "@vn-engine/vn-schema";

/** 当前背景显示状态。 */
export interface RuntimeBackgroundState {
  /** 背景素材 id。 */
  assetId: string;
  /** 背景切换转场类型。 */
  transition: TransitionType;
  /** 背景切换转场时长，单位毫秒。 */
  transitionDurationMs: number;
}

/** 当前镜头状态。 */
export interface RuntimeCameraState {
  /** 画面缩放倍率。 */
  zoom: number;
  /** 画面横向偏移。 */
  offsetX: number;
  /** 画面纵向偏移。 */
  offsetY: number;
  /** 是否启用轻微震动。 */
  shake: boolean;
  /** 震动强度。 */
  shakeIntensity: number;
  /** 镜头效果时长，单位毫秒。 */
  durationMs: number;
}

/** 待渲染的一次性演出效果。 */
export interface RuntimeEffect {
  /** 演出效果类型。 */
  type: "hideCharacter";
  /** 目标角色 id。 */
  characterId: string;
  /** 角色退场效果。 */
  exitEffect: CharacterExitEffect;
  /** 退场效果时长，单位毫秒。 */
  transitionDurationMs: number;
  /** 退场前角色显示状态。 */
  character?: RuntimeCharacterDisplay;
}

/** 当前显示的角色状态。 */
export interface RuntimeCharacterDisplay {
  /** 角色 id。 */
  characterId: string;
  /** 当前立绘素材 id。 */
  assetId?: string;
  /** 当前角色表情 id。 */
  expression?: string;
  /** 角色画面位置。 */
  position: CharacterPosition;
  /** 自定义位置横坐标。 */
  x?: number;
  /** 自定义位置纵坐标。 */
  y?: number;
  /** 缩放倍率。 */
  scale: number;
  /** 透明度。 */
  opacity: number;
  /** 显示层级。 */
  zIndex: number;
  /** 是否水平翻转。 */
  flipX: boolean;
  /** 角色登场效果。 */
  enterEffect: CharacterEnterEffect;
  /** 角色退场效果，仅用于退场快照。 */
  exitEffect?: CharacterExitEffect;
  /** 演出时长，单位毫秒。 */
  transitionDurationMs: number;
}

/** 当前播放的音频状态。 */
export interface RuntimeAudioState {
  /** 当前 BGM 素材 id。 */
  bgm?: string;
  /** 当前音效素材 id。 */
  sound?: string;
  /** 旧版音效通道兼容字段。 */
  sfx?: string;
  /** 当前语音素材 id。 */
  voice?: string;
}

/** 运行时调试事件。 */
export interface RuntimeDebugEvent {
  /** 调试事件唯一标识。 */
  id: string;
  /** 调试事件类型。 */
  type: "jump" | "condition" | "variable" | "error";
  /** 可读事件消息。 */
  message: string;
  /** 关联脚本 id。 */
  scriptId?: string;
  /** 关联节点 id。 */
  nodeId?: string;
  /** 创建时间。 */
  createdAt: string;
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
  /** 当前背景显示状态。 */
  background?: RuntimeBackgroundState;
  /** 当前显示的角色列表。 */
  characters: RuntimeCharacterDisplay[];
  /** 当前镜头状态。 */
  camera: RuntimeCameraState;
  /** 待渲染的一次性演出效果。 */
  pendingEffects: RuntimeEffect[];
  /** 当前音频状态。 */
  audio: RuntimeAudioState;
  /** 当前变量表。 */
  variables: Record<string, VariableValue>;
  /** 最近运行时调试日志。 */
  debugLog: RuntimeDebugEvent[];
  /** 运行时是否正在等待玩家选择。 */
  isWaitingChoice: boolean;
  /** 剧情是否已经结束。 */
  isEnded: boolean;
}
