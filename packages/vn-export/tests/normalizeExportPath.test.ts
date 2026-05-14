import { describe, expect, it } from "vitest";
import { normalizeExportPath } from "../src";

describe("normalizeExportPath", () => {
  it("能规范化 demo-assets 根路径", () => {
    expect(normalizeExportPath("/demo-assets/audio/bgm-demo.wav")).toEqual({
      ok: true,
      exportPath: "demo-assets/audio/bgm-demo.wav"
    });
  });

  it("能保留普通相对路径", () => {
    expect(normalizeExportPath("assets/audio/bgm/main.mp3")).toEqual({
      ok: true,
      exportPath: "assets/audio/bgm/main.mp3"
    });
  });

  it("能识别危险路径", () => {
    expect(normalizeExportPath("../secret.txt").ok).toBe(false);
    expect(normalizeExportPath("C:\\Users\\secret.mp3").ok).toBe(false);
    expect(normalizeExportPath("/etc/passwd").ok).toBe(false);
  });
});
