import { describe, expect, it } from "vitest";
import { collectProjectAssetRefs, createWebExportManifest } from "../src";
import { createExportTestProject } from "./testProject";

describe("collectProjectAssetRefs", () => {
  it("能收集背景、角色表情、BGM、sound 和 voice 资源", () => {
    const refs = collectProjectAssetRefs(createExportTestProject());
    expect(refs.map((ref) => ref.assetId)).toEqual([
      "bg-classroom",
      "lincheng-normal",
      "bgm-main",
      "sound-click",
      "voice-1"
    ]);
    expect(refs.every((ref) => ref.existsInDemoPublic)).toBe(true);
  });
});

describe("createWebExportManifest", () => {
  it("能生成正确项目 id 和素材列表", () => {
    const manifest = createWebExportManifest(createExportTestProject(), "2026-05-14T00:00:00.000Z");
    expect(manifest.exportFormat).toBe("vn-engine-web-export");
    expect(manifest.projectId).toBe("export-test");
    expect(manifest.projectBundlePath).toBe("game/project.bundle.json");
    expect(manifest.assetRefs).toHaveLength(5);
  });
});
