/** 播放器历史记录条目。 */
export interface HistoryEntry {
  /** 历史条目 id。 */
  id: string;
  /** 说话人名称或角色 id，旁白为空。 */
  speakerName?: string;
  /** 对话、旁白或选择文本。 */
  text: string;
  /** 对应脚本 id。 */
  scriptId: string;
  /** 对应节点 id。 */
  nodeId: string;
  /** ISO 格式创建时间。 */
  createdAt: string;
}
