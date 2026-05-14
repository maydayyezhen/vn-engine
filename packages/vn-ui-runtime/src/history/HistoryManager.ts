import type { HistoryEntry } from "./HistoryEntry";

/** 管理单次游玩会话中的历史记录。 */
export class HistoryManager {
  /** 最大历史条数。 */
  private readonly limit: number;
  /** 内部历史列表。 */
  private entries: HistoryEntry[] = [];

  /** 创建历史管理器。 */
  constructor(limit = 100) {
    this.limit = Math.max(1, limit);
  }

  /** 添加历史，连续重复的同节点同文本不会重复写入。 */
  push(entry: HistoryEntry): void {
    const last = this.entries[this.entries.length - 1];
    if (last && last.nodeId === entry.nodeId && last.scriptId === entry.scriptId && last.text === entry.text) return;
    this.entries.push({ ...entry });
    if (this.entries.length > this.limit) {
      this.entries = this.entries.slice(this.entries.length - this.limit);
    }
  }

  /** 获取历史列表副本。 */
  list(): HistoryEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /** 清空历史。 */
  clear(): void {
    this.entries = [];
  }
}
