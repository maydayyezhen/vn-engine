import type { RuntimeState } from "@vn-engine/vn-core";

/** 播放器存档槽位，保存恢复剧情所需的运行时状态和列表预览信息。 */
export interface SaveSlot {
  /** 存档槽位 id。 */
  slotId: string;
  /** 所属项目 id，用于避免不同项目存档混用。 */
  projectId: string;
  /** 存档标题。 */
  title: string;
  /** ISO 格式保存时间。 */
  savedAt: string;
  /** 存档列表中展示的文本预览。 */
  previewText: string;
  /** 当前说话人名称或角色 id。 */
  speakerName?: string;
  /** 当前背景素材 id。 */
  backgroundAssetId?: string;
  /** 当前脚本 id。 */
  currentScriptId: string;
  /** 当前节点 id，剧情结束时使用空字符串。 */
  currentNodeId: string;
  /** 可交给 VNRuntime.loadState 恢复的运行时状态。 */
  state: RuntimeState;
}
