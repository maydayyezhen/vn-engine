import { ref } from "vue";
import { SettingsStorage, type RuntimeSettings } from "@vn-engine/vn-ui-runtime";

/** 创建播放器设置状态。 */
export function usePlayerSettings(storage: Storage) {
  /** 设置存储器。 */
  const settingsStorage = new SettingsStorage(storage);
  /** 当前设置。 */
  const settings = ref<RuntimeSettings>(settingsStorage.load());

  /** 更新并持久化设置。 */
  function updateSettings(patch: Partial<RuntimeSettings>): void {
    settings.value = settingsStorage.save({ ...settings.value, ...patch });
  }

  return {
    settings,
    updateSettings
  };
}
