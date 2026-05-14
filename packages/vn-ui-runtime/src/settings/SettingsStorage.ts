import type { SaveStorageAdapter } from "../save/SaveData";
import { defaultRuntimeSettings } from "./defaultSettings";
import type { RuntimeSettings } from "./RuntimeSettings";

const DEFAULT_SETTINGS_KEY = "vn-engine:settings";

/** 基于键值存储的播放器设置读写器。 */
export class SettingsStorage {
  /** 底层键值存储。 */
  private readonly storage: SaveStorageAdapter;
  /** 设置使用的存储键。 */
  private readonly key: string;

  /** 创建设置读写器。 */
  constructor(storage: SaveStorageAdapter, key = DEFAULT_SETTINGS_KEY) {
    this.storage = storage;
    this.key = key;
  }

  /** 读取设置，解析失败时回退默认值。 */
  load(): RuntimeSettings {
    const raw = this.storage.getItem(this.key);
    if (!raw) return { ...defaultRuntimeSettings };
    try {
      const parsed = JSON.parse(raw) as Partial<RuntimeSettings>;
      return this.normalize(parsed);
    } catch {
      return { ...defaultRuntimeSettings };
    }
  }

  /** 保存完整或部分设置。 */
  save(settings: Partial<RuntimeSettings>): RuntimeSettings {
    const next = this.normalize({ ...this.load(), ...settings });
    this.storage.setItem(this.key, JSON.stringify(next));
    return next;
  }

  /** 清空本地设置。 */
  clear(): void {
    this.storage.removeItem(this.key);
  }

  /** 规整设置字段，避免非法值进入播放器。 */
  private normalize(settings: Partial<RuntimeSettings>): RuntimeSettings {
    return {
      masterVolume: this.clampVolume(settings.masterVolume, defaultRuntimeSettings.masterVolume),
      bgmVolume: this.clampVolume(settings.bgmVolume, defaultRuntimeSettings.bgmVolume),
      soundVolume: this.clampVolume(settings.soundVolume, defaultRuntimeSettings.soundVolume),
      voiceVolume: this.clampVolume(settings.voiceVolume, defaultRuntimeSettings.voiceVolume),
      muted: typeof settings.muted === "boolean" ? settings.muted : defaultRuntimeSettings.muted,
      autoPlayEnabled: typeof settings.autoPlayEnabled === "boolean" ? settings.autoPlayEnabled : defaultRuntimeSettings.autoPlayEnabled,
      autoPlayDelayMs: this.clampNumber(settings.autoPlayDelayMs, 300, 10000, defaultRuntimeSettings.autoPlayDelayMs),
      skipReadEnabled: typeof settings.skipReadEnabled === "boolean" ? settings.skipReadEnabled : defaultRuntimeSettings.skipReadEnabled,
      textSpeed: this.clampNumber(settings.textSpeed, 0.25, 4, defaultRuntimeSettings.textSpeed)
    };
  }

  /** 限制音量字段范围。 */
  private clampVolume(value: unknown, fallback: number): number {
    return this.clampNumber(value, 0, 1, fallback);
  }

  /** 限制数字字段范围。 */
  private clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== "number" || Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  }
}
