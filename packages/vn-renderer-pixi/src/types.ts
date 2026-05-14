import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { AssetItem, ChoiceOption, VNProject } from "@vn-engine/vn-schema";

/** PixiJS 视觉小说渲染器尺寸。 */
export interface VNRenderSize {
  /** 舞台宽度。 */
  width: number;
  /** 舞台高度。 */
  height: number;
}

/** PixiJS 视觉小说渲染器配置。 */
export interface PixiVNRendererOptions {
  /** 默认舞台宽度。 */
  width?: number;
  /** 默认舞台高度。 */
  height?: number;
  /** 玩家点击选项时触发的回调。 */
  onChoose?: (optionId: string) => void;
}

/** 单次渲染附加选项。 */
export interface PixiVNRenderOptions {
  /** 是否隐藏对话框和选项层。 */
  hideRuntimeUi?: boolean;
}

/** 解析后的背景资源。 */
export interface ResolvedBackgroundResource {
  /** 背景素材 id。 */
  assetId?: string;
  /** 背景显示名称。 */
  name: string;
  /** 背景路径。 */
  path?: string;
  /** 原始素材条目。 */
  asset?: AssetItem;
  /** 资源是否存在于素材库。 */
  exists: boolean;
}

/** 解析后的角色资源。 */
export interface ResolvedCharacterResource {
  /** 角色 id。 */
  characterId: string;
  /** 角色显示名称。 */
  characterName: string;
  /** 表情 id。 */
  expressionId?: string;
  /** 表情显示名称。 */
  expressionName: string;
  /** 立绘素材 id。 */
  assetId?: string;
  /** 立绘资源路径。 */
  path?: string;
  /** 角色位置。 */
  position: "left" | "center" | "right";
  /** 原始素材条目。 */
  asset?: AssetItem;
  /** 资源引用是否完整有效。 */
  exists: boolean;
}

/** 解析后的音频资源。 */
export interface ResolvedAudioResource {
  /** 音频通道。 */
  channel: string;
  /** 音频素材 id。 */
  assetId: string;
  /** 音频显示名称。 */
  name: string;
  /** 音频路径。 */
  path?: string;
  /** 原始素材条目。 */
  asset?: AssetItem;
  /** 资源是否存在于素材库。 */
  exists: boolean;
}

/** 解析后的渲染资源集合。 */
export interface ResolvedRenderResources {
  /** 当前背景资源。 */
  background: ResolvedBackgroundResource;
  /** 当前角色资源列表。 */
  characters: ResolvedCharacterResource[];
  /** 当前音频资源列表，本轮仅用于调试显示。 */
  audio: ResolvedAudioResource[];
}

/** 选择层渲染输入。 */
export interface ChoiceLayerRenderInput {
  /** 当前运行时快照。 */
  snapshot: RuntimeSnapshot;
  /** 当前项目数据。 */
  project: VNProject;
  /** 选项列表。 */
  choices: ChoiceOption[];
}
