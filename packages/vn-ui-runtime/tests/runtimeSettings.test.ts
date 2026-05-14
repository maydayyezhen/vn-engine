import { describe, expect, it, vi } from "vitest";
import { AutoPlayController, defaultRuntimeSettings, SettingsStorage } from "../src";
import { createMemoryStorage, createTestSnapshot } from "./testUtils";

describe("SettingsStorage", () => {
  it("读取失败时能回退默认值", () => {
    const storage = createMemoryStorage();
    storage.setItem("vn-engine:settings", "{bad json");
    const settings = new SettingsStorage(storage).load();
    expect(settings).toEqual(defaultRuntimeSettings);
  });

  it("能保存并规整设置", () => {
    const storage = new SettingsStorage(createMemoryStorage());
    const settings = storage.save({ masterVolume: 2, autoPlayDelayMs: 100 });
    expect(settings.masterVolume).toBe(1);
    expect(settings.autoPlayDelayMs).toBe(300);
  });
});

describe("AutoPlayController", () => {
  it("遇到选项或结束状态时不会继续自动推进", () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    const controller = new AutoPlayController({ delayMs: 500, onNext });
    const snapshot = createTestSnapshot();

    controller.start({ ...snapshot, type: "choices", choices: [{ id: "a", text: "A", target: { scriptId: "start", nodeId: "a" } }] });
    vi.advanceTimersByTime(1000);
    expect(onNext).not.toHaveBeenCalled();

    controller.start({ ...snapshot, type: "ended", isEnded: true });
    vi.advanceTimersByTime(1000);
    expect(onNext).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
