/** 跳转目标，指向某个脚本中的某个节点。 */
export interface NodeTarget {
  /** 目标脚本 id。 */
  scriptId: string;
  /** 目标节点 id。 */
  nodeId: string;
}

/** 变量值类型，第一阶段只支持 JSON 基础值。 */
export type VariableValue = string | number | boolean | null;

/** 剧情节点类型。 */
export type NodeType =
  | "dialogue"
  | "narration"
  | "choice"
  | "scene"
  | "showCharacter"
  | "hideCharacter"
  | "playAudio"
  | "stopAudio"
  | "setVariable"
  | "condition"
  | "jump";

/** 音频通道类型，保留 sfx 作为旧数据兼容别名。 */
export type StoryAudioChannel = "bgm" | "sound" | "voice" | "sfx";

/** 变量比较运算符。 */
export type ConditionOperator = "equals" | "notEquals" | "greaterThan" | "lessThan" | "exists";

/** 条件节点中的一个分支。 */
export interface ConditionBranch {
  /** 分支唯一标识。 */
  id: string;
  /** 要读取的变量名。 */
  variable: string;
  /** 比较运算符。 */
  operator: ConditionOperator;
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
}

/** 旁白节点，不绑定说话角色。 */
export interface NarrationNode {
  /** 节点类型。 */
  type: "narration";
  /** 节点唯一标识。 */
  id: string;
  /** 旁白文本。 */
  text: string;
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
  position?: "left" | "center" | "right";
}

/** 角色隐藏节点。 */
export interface HideCharacterNode {
  /** 节点类型。 */
  type: "hideCharacter";
  /** 节点唯一标识。 */
  id: string;
  /** 要隐藏的角色 id。 */
  characterId: string;
}

/** 播放音频节点。 */
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
  /** 变量名。 */
  name: string;
  /** 变量值。 */
  value: VariableValue;
}

/** 条件跳转节点。 */
export interface ConditionNode {
  /** 节点类型。 */
  type: "condition";
  /** 节点唯一标识。 */
  id: string;
  /** 条件分支列表，按顺序匹配第一个成立分支。 */
  branches: ConditionBranch[];
  /** 所有分支都不成立时的可选跳转目标。 */
  fallbackTarget?: NodeTarget;
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

/** 剧情节点联合类型。 */
export type StoryNode =
  | DialogueNode
  | NarrationNode
  | ChoiceNode
  | SceneNode
  | ShowCharacterNode
  | HideCharacterNode
  | PlayAudioNode
  | StopAudioNode
  | SetVariableNode
  | ConditionNode
  | JumpNode;
