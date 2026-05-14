import { describe, expect, it } from "vitest";
import { createProjectAssetExportPlan, createWebExportManifest, validateExportProject } from "../src";
import { createExportTestProject } from "./testProject";

describe("project asset export plan", () => {
  it("工程内相对素材路径能生成导出路径", () => {
    const project = createExportTestProject();
    project.assets.items[0] = {
      ...project.assets.items[0],
      path: "assets/background/classroom.png"
    };
    const plan = createProjectAssetExportPlan(project);
    expect(plan[0]?.sourcePath).toBe("assets/background/classroom.png");
    expect(plan[0]?.exportPath).toBe("assets/background/classroom.png");
  });

  it("危险路径会阻止导出", () => {
    const project = createExportTestProject();
    project.assets.items[0] = {
      ...project.assets.items[0],
      path: "C:\\Users\\test\\secret.png"
    };
    expect(validateExportProject(project).valid).toBe(false);
  });

  it("合法导出清单不包含绝对路径", () => {
    const project = createExportTestProject();
    project.assets.items = project.assets.items.map((asset) => ({
      ...asset,
      path: `assets/${asset.type}/${asset.id}.dat`
    }));
    const manifest = createWebExportManifest(project);
    expect(manifest.assetRefs.every((asset) => !/^[a-zA-Z]:[\\/]/.test(asset.exportPath))).toBe(true);
    expect(manifest.assetRefs.every((asset) => !asset.exportPath.startsWith("/"))).toBe(true);
  });
});
