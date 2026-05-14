import type { SaveSlot } from "./SaveSlot";

/** 存档列表的序列化结构。 */
export interface SaveData {
  /** 所有存档槽位。 */
  slots: SaveSlot[];
}

/** 存档和设置使用的最小键值存储接口，可由 localStorage 或测试 mock 实现。 */
export interface SaveStorageAdapter {
  /** 读取指定键。 */
  getItem(key: string): string | null;
  /** 写入指定键。 */
  setItem(key: string, value: string): void;
  /** 删除指定键。 */
  removeItem(key: string): void;
}
