import type { SaveData, SaveStorageAdapter } from "./SaveData";
import type { SaveSlot } from "./SaveSlot";

const DEFAULT_SAVE_KEY = "vn-engine:saves";

/** 基于键值存储的存档读写器。 */
export class SaveStorage {
  /** 底层键值存储。 */
  private readonly storage: SaveStorageAdapter;
  /** 存档使用的存储键。 */
  private readonly key: string;

  /** 创建存档读写器。 */
  constructor(storage: SaveStorageAdapter, key = DEFAULT_SAVE_KEY) {
    this.storage = storage;
    this.key = key;
  }

  /** 获取全部存档，解析失败时返回空列表。 */
  listSaves(): SaveSlot[] {
    return this.readData().slots.sort((a, b) => a.slotId.localeCompare(b.slotId));
  }

  /** 保存或覆盖一个槽位。 */
  save(slot: SaveSlot): void {
    const data = this.readData();
    const nextSlots = data.slots.filter((item) => item.slotId !== slot.slotId);
    nextSlots.push(this.cloneSlot(slot));
    this.writeData({ slots: nextSlots });
  }

  /** 读取指定槽位。 */
  load(slotId: string): SaveSlot | undefined {
    const slot = this.readData().slots.find((item) => item.slotId === slotId);
    return slot ? this.cloneSlot(slot) : undefined;
  }

  /** 删除指定槽位。 */
  remove(slotId: string): void {
    const data = this.readData();
    this.writeData({ slots: data.slots.filter((item) => item.slotId !== slotId) });
  }

  /** 清空全部存档。 */
  clear(): void {
    this.storage.removeItem(this.key);
  }

  /** 读取并容错解析存档数据。 */
  private readData(): SaveData {
    const raw = this.storage.getItem(this.key);
    if (!raw) return { slots: [] };
    try {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (!Array.isArray(parsed.slots)) return { slots: [] };
      return { slots: parsed.slots.filter((slot) => typeof slot?.slotId === "string") as SaveSlot[] };
    } catch {
      return { slots: [] };
    }
  }

  /** 写入完整存档数据。 */
  private writeData(data: SaveData): void {
    this.storage.setItem(this.key, JSON.stringify(data));
  }

  /** 深拷贝存档槽位，避免外部修改内部序列化对象。 */
  private cloneSlot(slot: SaveSlot): SaveSlot {
    return JSON.parse(JSON.stringify(slot)) as SaveSlot;
  }
}
