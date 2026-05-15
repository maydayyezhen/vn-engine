import type { AnimationTargets, CharacterEnterEffect, CharacterExitEffect, CharacterPosition, TransitionType, VariableValue, VNEasing, VNActionType } from "@vn-engine/vn-schema";

/** 当前背景显示状态。 */
export interface RuntimeBackgroundState {
  /** 背景素材 id。 */
  assetId: string;
  /** 背景切换转场类型。 */
  transition?: TransitionType;
  /** 背景切换转场时长，单位毫秒。 */
  transitionDurationMs?: number;
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
  id: string;
  type: "backgroundTransition" | "showCharacter" | "hideCharacter" | "showProp" | "hideProp";
  /** 背景素材 id。 */
  backgroundAssetId?: string;
  /** 背景切换转场。 */
  transition?: TransitionType;
  /** 目标角色 id。 */
  characterId?: string;
  /** 角色退场效果。 */
  enterEffect?: CharacterEnterEffect;
  exitEffect?: CharacterExitEffect;
  /** 退场效果时长，单位毫秒。 */
  transitionDurationMs: number;
  /** 退场前角色显示状态。 */
  character?: RuntimeCharacterDisplay;
  /** 目标物品显示对象 id。 */
  propId?: string;
  /** 物品动画模块 id。 */
  animationId?: string;
  /** 物品动画参数。 */
  animationParams?: Record<string, unknown>;
  /** 物品静态显示状态快照。 */
  prop?: RuntimePropDisplay;
}

/** 等待渲染器播放的动作效果。 */
export interface RuntimeActionEffect {
  /** 动作 id。 */
  actionId: string;
  /** 动作类型。 */
  actionType: VNActionType;
  /** 动作持续时间，单位毫秒。 */
  durationMs: number;
  /** 动作缓动。 */
  easing: VNEasing;
  /** 是否属于并行动作组。 */
  parallelGroupId?: string;
  /** 动作参数快照。 */
  payload: Record<string, unknown>;
}

/** 等待渲染器播放的一次性代码型动画效果。 */
export interface RuntimeAnimationEffect {
  /** 一次性动画效果 id，用于避免 renderer 重复消费。 */
  effectId: string;
  /** 动画模块 id。 */
  animationId: string;
  /** 动画目标映射。 */
  targets: AnimationTargets;
  /** 动画参数快照。 */
  params?: Record<string, unknown>;
  /** 是否等待动画完成。 */
  waitForCompletion: boolean;
  /** 动画完成后是否自动继续剧情。 */
  autoNext: boolean;
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
  enterEffect?: CharacterEnterEffect;
  /** 角色退场效果，仅用于退场快照。 */
  exitEffect?: CharacterExitEffect;
  /** 演出时长，单位毫秒。 */
  transitionDurationMs?: number;
}

/** 当前显示的物品状态。 */
export interface RuntimePropDisplay {
  /** 物品显示对象 id。 */
  propId: string;
  /** 指向素材库中 prop 素材的 id。 */
  assetId: string;
  /** 物品显示名称。 */
  name?: string;
  /** 舞台横向坐标。 */
  x: number;
  /** 舞台纵向坐标。 */
  y: number;
  /** 缩放倍率。 */
  scale: number;
  /** 透明度。 */
  opacity: number;
  /** 显示层级。 */
  zIndex: number;
  /** 旋转角度。 */
  rotation: number;
  /** 是否水平翻转。 */
  flipX: boolean;
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
  type: "jump" | "condition" | "variable" | "action" | "error";
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
  /** 当前显示的物品列表。 */
  props: RuntimePropDisplay[];
  /** 当前镜头状态。 */
  camera: RuntimeCameraState;
  /** 待渲染的一次性演出效果。 */
  pendingEffects: RuntimeEffect[];
  /** 等待渲染器播放的动作序列效果。 */
  pendingActions: RuntimeActionEffect[];
  /** 等待渲染器播放的一次性代码型动画效果。 */
  pendingAnimations: RuntimeAnimationEffect[];
  /** 当前音频状态。 */
  audio: RuntimeAudioState;
  /** 当前变量表。 */
  variables: Record<string, VariableValue>;
  /** 最近运行时调试日志。 */
  debugLog: RuntimeDebugEvent[];
  /** 运行时是否正在等待玩家选择。 */
  isWaitingChoice: boolean;
  /** 是否正在等待动作序列播放完成。 */
  isWaitingForActionCompletion: boolean;
  /** 剧情是否已经结束。 */
  isEnded: boolean;
}
