import type { ChoiceOption, VariableValue } from "@vn-engine/vn-schema";
import type { RuntimeAudioState, RuntimeBackgroundState, RuntimeCameraState, RuntimeCharacterDisplay, RuntimeEffect } from "./RuntimeState";

/** 运行时快照类型，用于告诉 UI 当前应该展示什么。 */
export type RuntimeSnapshotType = "dialogue" | "choices" | "ended";

/** 提供给播放器或编辑器预览的只读运行时快照。 */
export interface RuntimeSnapshot {
  /** 快照类型。 */
  type: RuntimeSnapshotType;
  /** 当前脚本 id。 */
  currentScriptId: string;
  /** 当前节点 id。 */
  currentNodeId: string | null;
  /** 当前背景素材 id。 */
  backgroundAssetId?: string;
  /** 当前背景演出状态。 */
  background?: RuntimeBackgroundState;
  /** 当前显示角色列表。 */
  characters: RuntimeCharacterDisplay[];
  /** 当前镜头状态。 */
  camera: RuntimeCameraState;
  /** 待渲染的一次性演出效果。 */
  pendingEffects: RuntimeEffect[];
  /** 当前说话人显示名称或角色 id，旁白为空。 */
  speaker: string | null;
  /** 当前文本内容。 */
  text: string;
  /** 当前文本显示速度。 */
  textSpeed?: number;
  /** 当前文本是否自动进入下一句。 */
  autoNext?: boolean;
  /** 当前文本是否等待点击。 */
  waitForClick?: boolean;
  /** 当前可选项列表。 */
  choices: ChoiceOption[];
  /** 当前变量快照。 */
  variables: Record<string, VariableValue>;
  /** 当前音频状态。 */
  audio: RuntimeAudioState;
  /** 剧情是否已经结束。 */
  isEnded: boolean;
}
