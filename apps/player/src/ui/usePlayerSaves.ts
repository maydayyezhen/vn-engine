import { computed, ref, watch, type Ref } from "vue";
import type { RuntimeSnapshot, RuntimeState } from "@vn-engine/vn-core";
import { createSavePreview, SaveStorage, type SaveSlot } from "@vn-engine/vn-ui-runtime";

const SAVE_SLOT_IDS = ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"];

/** 创建播放器存档状态和操作。 */
export function usePlayerSaves(storage: Storage, projectId: Ref<string>) {
  /** 当前存档列表。 */
  const saves = ref<SaveSlot[]>(createStorage().listSaves());
  /** 固定槽位视图。 */
  const slots = computed(() => SAVE_SLOT_IDS.map((slotId) => saves.value.find((slot) => slot.slotId === slotId)));

  /** 刷新存档列表。 */
  function refresh(): void {
    saves.value = createStorage().listSaves().filter((slot) => slot.projectId === projectId.value);
  }

  /** 保存当前进度到指定槽位。 */
  function saveCurrent(slotId: string, snapshot: RuntimeSnapshot, state: RuntimeState): void {
    createStorage().save(createSavePreview(slotId, snapshot, state, new Date().toISOString(), projectId.value));
    refresh();
  }

  /** 读取指定槽位。 */
  function load(slotId: string): SaveSlot | undefined {
    const slot = createStorage().load(slotId);
    return slot?.projectId === projectId.value ? slot : undefined;
  }

  /** 删除指定槽位。 */
  function remove(slotId: string): void {
    createStorage().remove(slotId);
    refresh();
  }

  /** 创建当前项目隔离的存档读写器。 */
  function createStorage(): SaveStorage {
    return new SaveStorage(storage, `vn-engine:saves:${projectId.value}`);
  }

  watch(projectId, refresh);

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
