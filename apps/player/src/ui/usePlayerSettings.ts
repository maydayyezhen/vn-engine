import { ref, watch, type Ref } from "vue";
import { SettingsStorage, type RuntimeSettings } from "@vn-engine/vn-ui-runtime";

/** 创建播放器设置状态。 */
export function usePlayerSettings(storage: Storage, projectId: Ref<string>) {
  /** 当前设置。 */
  const settings = ref<RuntimeSettings>(createStorage().load());

  /** 更新并持久化设置。 */
  function updateSettings(patch: Partial<RuntimeSettings>): void {
    settings.value = createStorage().save({ ...settings.value, ...patch });
  }

  /** 创建当前项目隔离的设置读写器。 */
  function createStorage(): SettingsStorage {
    return new SettingsStorage(storage, `vn-engine:settings:${projectId.value}`);
  }

  watch(projectId, () => {
    settings.value = createStorage().load();
  });

  return {
    settings,
    updateSettings
  };
}
