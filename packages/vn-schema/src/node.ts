/** 跳转目标，指向某个脚本中的某个节点。 */
export interface NodeTarget {
  /** 目标脚本 id。 */
  scriptId: string;
  /** 目标节点 id。 */
  nodeId?: string;
  /** 目标标签名称。 */
  label?: string;
}

/** 变量值类型，第一阶段只支持 JSON 基础值。 */
export type VariableValue = string | number | boolean | null;

/** 项目级变量类型。 */
export type VNVariableType = "boolean" | "number" | "string";

/** 项目级变量定义，用于初始化、校验和编辑器提示。 */
export interface VNVariableDefinition {
  /** 变量名称。 */
  name: string;
  /** 变量类型。 */
  type: VNVariableType;
  /** 变量默认值。 */
  defaultValue: boolean | number | string;
  /** 变量说明。 */
  description?: string;
}

/** 剧情节点类型。 */
export type NodeType =
  | "dialogue"
  | "narration"
  | "choice"
  | "scene"
  | "showCharacter"
  | "hideCharacter"
  | "camera"
  | "actionSequence"
  | "label"
  | "playAudio"
  | "stopAudio"
  | "setVariable"
  | "condition"
  | "jump";

/** 背景转场类型。 */
export type TransitionType = "none" | "fade" | "slideLeft" | "slideRight";

/** 角色登场演出类型。 */
export type CharacterEnterEffect = "none" | "fadeIn" | "slideInLeft" | "slideInRight";

/** 角色退场演出类型。 */
export type CharacterExitEffect = "none" | "fadeOut" | "slideOutLeft" | "slideOutRight";

/** 角色画面位置类型。 */
export type CharacterPosition = "left" | "center" | "right" | "custom";

/** 音频通道类型，保留 sfx 作为旧数据兼容别名。 */
export type StoryAudioChannel = "bgm" | "sound" | "voice" | "sfx";

/** 演出动作缓动类型，第一阶段主要作为可序列化配置保存。 */
export type VNEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";

/** 演出动作类型。 */
export type VNActionType =
  | "wait"
  | "scene"
  | "showCharacter"
  | "hideCharacter"
  | "moveCharacter"
  | "changeExpression"
  | "camera"
  | "playAudio"
  | "stopAudio"
  | "parallel";

/** 演出动作基础字段。 */
export interface BaseVNAction {
  /** 动作在当前动作序列内的唯一 id。 */
  id: string;
  /** 动作类型。 */
  type: VNActionType;
  /** 动作持续时间，单位毫秒。 */
  durationMs?: number;
  /** 动作缓动类型。 */
  easing?: VNEasing;
}

/** 等待动作。 */
export interface WaitAction extends BaseVNAction {
  /** 动作类型。 */
  type: "wait";
}

/** 背景切换动作。 */
export interface SceneAction extends BaseVNAction {
  /** 动作类型。 */
  type: "scene";
  /** 背景素材 id。 */
  backgroundAssetId: string;
  /** 背景转场类型。 */
  transition?: TransitionType;
}

/** 角色显示动作。 */
export interface ShowCharacterAction extends BaseVNAction {
  /** 动作类型。 */
  type: "showCharacter";
  /** 角色 id。 */
  characterId: string;
  /** 表情 id。 */
  expression?: string;
  /** 角色位置。 */
  position?: CharacterPosition;
  /** 自定义横坐标。 */
  x?: number;
  /** 自定义纵坐标。 */
  y?: number;
  /** 缩放。 */
  scale?: number;
  /** 透明度。 */
  opacity?: number;
  /** 层级。 */
  zIndex?: number;
  /** 是否水平翻转。 */
  flipX?: boolean;
  /** 入场效果。 */
  enterEffect?: CharacterEnterEffect;
}

/** 角色隐藏动作。 */
export interface HideCharacterAction extends BaseVNAction {
  /** 动作类型。 */
  type: "hideCharacter";
  /** 角色 id。 */
  characterId: string;
  /** 退场效果。 */
  exitEffect?: CharacterExitEffect;
}

/** 角色移动或显示参数变更动作。 */
export interface MoveCharacterAction extends BaseVNAction {
  /** 动作类型。 */
  type: "moveCharacter";
  /** 角色 id。 */
  characterId: string;
  /** 角色位置。 */
  position?: CharacterPosition;
  /** 自定义横坐标。 */
  x?: number;
  /** 自定义纵坐标。 */
  y?: number;
  /** 缩放。 */
  scale?: number;
  /** 透明度。 */
  opacity?: number;
  /** 层级。 */
  zIndex?: number;
  /** 是否水平翻转。 */
  flipX?: boolean;
}

/** 角色表情切换动作。 */
export interface ChangeExpressionAction extends BaseVNAction {
  /** 动作类型。 */
  type: "changeExpression";
  /** 角色 id。 */
  characterId: string;
  /** 表情 id。 */
  expression: string;
}

/** 镜头动作。 */
export interface CameraAction extends BaseVNAction {
  /** 动作类型。 */
  type: "camera";
  /** 画面缩放。 */
  zoom?: number;
  /** 横向偏移。 */
  offsetX?: number;
  /** 纵向偏移。 */
  offsetY?: number;
  /** 是否震动。 */
  shake?: boolean;
  /** 震动强度。 */
  shakeIntensity?: number;
}

/** 音频播放动作。 */
export interface PlayAudioAction extends BaseVNAction {
  /** 动作类型。 */
  type: "playAudio";
  /** 音频通道。 */
  channel: StoryAudioChannel;
  /** 音频素材 id。 */
  assetId: string;
  /** 是否循环。 */
  loop?: boolean;
}

/** 音频停止动作。 */
export interface StopAudioAction extends BaseVNAction {
  /** 动作类型。 */
  type: "stopAudio";
  /** 要停止的通道；为空时表示停止全部。 */
  channel?: StoryAudioChannel;
}

/** 并行动作组。 */
export interface ParallelAction extends BaseVNAction {
  /** 动作类型。 */
  type: "parallel";
  /** 同时执行的子动作列表。 */
  actions: VNAction[];
}

/** 可序列化演出动作联合类型。 */
export type VNAction =
  | WaitAction
  | SceneAction
  | ShowCharacterAction
  | HideCharacterAction
  | MoveCharacterAction
  | ChangeExpressionAction
  | CameraAction
  | PlayAudioAction
  | StopAudioAction
  | ParallelAction;

/** 旧版条件分支比较运算符。 */
export type LegacyConditionOperator = "equals" | "notEquals" | "greaterThan" | "lessThan" | "exists";

/** 结构化条件比较运算符。 */
export type ConditionOperator = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "notContains";

/** 单个变量条件表达式。 */
export interface VariableCondition {
  /** 条件类型。 */
  kind: "variable";
  /** 变量名称。 */
  variableName: string;
  /** 比较运算符。 */
  operator: ConditionOperator;
  /** 比较值。 */
  value: boolean | number | string;
}

/** and 组合条件。 */
export interface AndCondition {
  /** 条件类型。 */
  kind: "and";
  /** 子条件列表。 */
  conditions: ConditionExpression[];
}

/** or 组合条件。 */
export interface OrCondition {
  /** 条件类型。 */
  kind: "or";
  /** 子条件列表。 */
  conditions: ConditionExpression[];
}

/** not 取反条件。 */
export interface NotCondition {
  /** 条件类型。 */
  kind: "not";
  /** 被取反的子条件。 */
  condition: ConditionExpression;
}

/** 可序列化的结构化条件表达式。 */
export type ConditionExpression = VariableCondition | AndCondition | OrCondition | NotCondition;

/** 条件节点中的一个分支。 */
export interface ConditionBranch {
  /** 分支唯一标识。 */
  id: string;
  /** 要读取的变量名。 */
  variable: string;
  /** 比较运算符。 */
  operator: LegacyConditionOperator;
  /** 用于比较的目标值。 */
  value?: VariableValue;
  /** 条件成立时跳转到的目标。 */
  target: NodeTarget;
}

/** 选项节点中的一个玩家选项。 */
export interface ChoiceOption {
  /** 选项唯一标识。 */
  id: string;
  /** 展示给玩家的选项文本。 */
  text: string;
  /** 选择该选项后要写入的变量。 */
  setVariables?: Record<string, VariableValue>;
  /** 选择该选项后跳转到的目标。 */
  target: NodeTarget;
}

/** 对话节点，由角色说一句话。 */
export interface DialogueNode {
  /** 节点类型。 */
  type: "dialogue";
  /** 节点唯一标识。 */
  id: string;
  /** 说话角色 id。 */
  characterId: string;
  /** 台词文本。 */
  text: string;
  /** 文本显示速度，数值越大代表越快。 */
  textSpeed?: number;
  /** 是否自动进入下一句。 */
  autoNext?: boolean;
  /** 是否等待玩家点击。 */
  waitForClick?: boolean;
}

/** 旁白节点，不绑定说话角色。 */
export interface NarrationNode {
  /** 节点类型。 */
  type: "narration";
  /** 节点唯一标识。 */
  id: string;
  /** 旁白文本。 */
  text: string;
  /** 文本显示速度，数值越大代表越快。 */
  textSpeed?: number;
  /** 是否自动进入下一句。 */
  autoNext?: boolean;
  /** 是否等待玩家点击。 */
  waitForClick?: boolean;
}

/** 选项节点，等待玩家选择。 */
export interface ChoiceNode {
  /** 节点类型。 */
  type: "choice";
  /** 节点唯一标识。 */
  id: string;
  /** 选项提示文本。 */
  prompt?: string;
  /** 可供玩家选择的选项列表。 */
  options: ChoiceOption[];
}

/** 场景节点，用于切换背景。 */
export interface SceneNode {
  /** 节点类型。 */
  type: "scene";
  /** 节点唯一标识。 */
  id: string;
  /** 背景素材 id。 */
  backgroundAssetId: string;
  /** 背景切换转场类型。 */
  transition?: TransitionType;
  /** 背景切换转场时长，单位毫秒。 */
  transitionDurationMs?: number;
}

/** 角色登场节点。 */
export interface ShowCharacterNode {
  /** 节点类型。 */
  type: "showCharacter";
  /** 节点唯一标识。 */
  id: string;
  /** 角色 id。 */
  characterId: string;
  /** 立绘素材 id。 */
  assetId?: string;
  /** 表情标识。 */
  expression?: string;
  /** 角色在画面中的位置。 */
  position?: CharacterPosition;
  /** 自定义位置横坐标，仅 position 为 custom 时使用。 */
  x?: number;
  /** 自定义位置纵坐标，仅 position 为 custom 时使用。 */
  y?: number;
  /** 角色缩放倍率。 */
  scale?: number;
  /** 角色透明度，范围 0 到 1。 */
  opacity?: number;
  /** 角色显示层级，数值越大越靠前。 */
  zIndex?: number;
  /** 是否水平翻转立绘。 */
  flipX?: boolean;
  /** 角色登场效果。 */
  enterEffect?: CharacterEnterEffect;
  /** 角色登场动画时长，单位毫秒。 */
  transitionDurationMs?: number;
}

/** 角色隐藏节点。 */
export interface HideCharacterNode {
  /** 节点类型。 */
  type: "hideCharacter";
  /** 节点唯一标识。 */
  id: string;
  /** 要隐藏的角色 id。 */
  characterId: string;
  /** 角色退场效果。 */
  exitEffect?: CharacterExitEffect;
  /** 角色退场动画时长，单位毫秒。 */
  transitionDurationMs?: number;
}

/** 基础镜头节点，用于更新画面缩放、偏移和轻微震动状态。 */
export interface CameraNode {
  /** 节点类型。 */
  type: "camera";
  /** 节点唯一标识。 */
  id: string;
  /** 画面缩放倍率。 */
  zoom?: number;
  /** 画面横向偏移。 */
  offsetX?: number;
  /** 画面纵向偏移。 */
  offsetY?: number;
  /** 是否启用轻微震动。 */
  shake?: boolean;
  /** 震动强度。 */
  shakeIntensity?: number;
  /** 镜头效果时长，单位毫秒。 */
  durationMs?: number;
}

/** 播放音频节点。 */
/** 动作序列节点，用结构化动作描述一段可等待完成的演出。 */
export interface ActionSequenceNode {
  /** 节点类型。 */
  type: "actionSequence";
  /** 节点唯一标识。 */
  id: string;
  /** 动作序列显示名称。 */
  name?: string;
  /** 顺序执行的动作列表。 */
  actions: VNAction[];
  /** 动作完成后是否自动进入后续剧情。 */
  autoNext?: boolean;
  /** 是否等待渲染器播放完成后再推进。 */
  waitForCompletion?: boolean;
}

export interface PlayAudioNode {
  /** 节点类型。 */
  type: "playAudio";
  /** 节点唯一标识。 */
  id: string;
  /** 音频通道。 */
  channel: StoryAudioChannel;
  /** 音频素材 id。 */
  assetId: string;
  /** 是否循环播放。 */
  loop?: boolean;
}

/** 停止音频节点。 */
export interface StopAudioNode {
  /** 节点类型。 */
  type: "stopAudio";
  /** 节点唯一标识。 */
  id: string;
  /** 要停止的音频通道。 */
  channel: StoryAudioChannel;
}

/** 设置变量节点。 */
export interface SetVariableNode {
  /** 节点类型。 */
  type: "setVariable";
  /** 节点唯一标识。 */
  id: string;
  /** 变量名，新数据优先使用该字段。 */
  variableName?: string;
  /** 变量名，旧数据兼容字段。 */
  name?: string;
  /** 变量赋值运算符。 */
  operator?: VariableAssignOperator;
  /** 变量值。 */
  value: VariableValue;
}

/** 变量赋值运算符。 */
export type VariableAssignOperator = "set" | "add" | "subtract";

/** 条件跳转节点。 */
export interface ConditionNode {
  /** 节点类型。 */
  type: "condition";
  /** 节点唯一标识。 */
  id: string;
  /** 条件分支列表，按顺序匹配第一个成立分支，保留旧数据兼容。 */
  branches?: ConditionBranch[];
  /** 所有分支都不成立时的可选跳转目标。 */
  fallbackTarget?: NodeTarget;
  /** 新版结构化条件表达式。 */
  condition?: ConditionExpression;
  /** 条件成立时的跳转目标。 */
  trueTarget?: NodeTarget;
  /** 条件不成立时的跳转目标。 */
  falseTarget?: NodeTarget;
}

/** 直接跳转节点。 */
export interface JumpNode {
  /** 节点类型。 */
  type: "jump";
  /** 节点唯一标识。 */
  id: string;
  /** 跳转目标。 */
  target: NodeTarget;
}

/** 标签节点，用于作为稳定跳转锚点。 */
export interface LabelNode {
  /** 节点类型。 */
  type: "label";
  /** 节点唯一标识。 */
  id: string;
  /** 标签名称。 */
  name: string;
  /** 标签说明。 */
  description?: string;
}

/** 剧情节点联合类型。 */
export type StoryNode =
  | DialogueNode
  | NarrationNode
  | ChoiceNode
  | SceneNode
  | ShowCharacterNode
  | HideCharacterNode
  | CameraNode
  | ActionSequenceNode
  | LabelNode
  | PlayAudioNode
  | StopAudioNode
  | SetVariableNode
  | ConditionNode
  | JumpNode;
