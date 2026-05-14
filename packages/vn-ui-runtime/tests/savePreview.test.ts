import { describe, expect, it } from "vitest";
import { createSavePreview, SaveStorage } from "../src";
import { createMemoryStorage, createTestSnapshot, createTestState } from "./testUtils";

describe("createSavePreview", () => {
  it("能从快照生成存档预览", () => {
    const slot = createSavePreview("slot-1", createTestSnapshot(), createTestState(), "2026-05-14T00:00:00.000Z");
    expect(slot.slotId).toBe("slot-1");
    expect(slot.previewText).toBe("这里是测试文本。");
    expect(slot.speakerName).toBe("林澄");
    expect(slot.backgroundAssetId).toBe("bg-classroom");
    expect(slot.state.audio.bgm).toBe("bgm-main");
  });
});

describe("SaveStorage", () => {
  it("能保存、读取和删除存档", () => {
    const storage = new SaveStorage(createMemoryStorage());
    const slot = createSavePreview("slot-1", createTestSnapshot(), createTestState(), "2026-05-14T00:00:00.000Z");

    storage.save(slot);
    expect(storage.listSaves()).toHaveLength(1);
    expect(storage.load("slot-1")?.previewText).toBe("这里是测试文本。");

    storage.remove("slot-1");
    expect(storage.load("slot-1")).toBeUndefined();
  });
});
