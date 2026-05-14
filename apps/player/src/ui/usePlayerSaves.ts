import { computed, ref } from "vue";
import type { RuntimeSnapshot, RuntimeState } from "@vn-engine/vn-core";
import { createSavePreview, SaveStorage, type SaveSlot } from "@vn-engine/vn-ui-runtime";

const SAVE_SLOT_IDS = ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"];

/** 创建播放器存档状态和操作。 */
export function usePlayerSaves(storage: Storage) {
  /** 存档读写器。 */
  const saveStorage = new SaveStorage(storage);
  /** 当前存档列表。 */
  const saves = ref<SaveSlot[]>(saveStorage.listSaves());
  /** 固定槽位视图。 */
  const slots = computed(() => SAVE_SLOT_IDS.map((slotId) => saves.value.find((slot) => slot.slotId === slotId)));

  /** 刷新存档列表。 */
  function refresh(): void {
    saves.value = saveStorage.listSaves();
  }

  /** 保存当前进度到指定槽位。 */
  function saveCurrent(slotId: string, snapshot: RuntimeSnapshot, state: RuntimeState): void {
    saveStorage.save(createSavePreview(slotId, snapshot, state));
    refresh();
  }

  /** 读取指定槽位。 */
  function load(slotId: string): SaveSlot | undefined {
    return saveStorage.load(slotId);
  }

  /** 删除指定槽位。 */
  function remove(slotId: string): void {
    saveStorage.remove(slotId);
    refresh();
  }

  return {
    slotIds: SAVE_SLOT_IDS,
    saves,
    slots,
    refresh,
    saveCurrent,
    load,
    remove
  };
}
