import { describe, expect, it } from "vitest";
import { serializeProject } from "@vn-engine/vn-project";
import { loadFallbackDemoProject } from "./loadFallbackDemoProject";
import { loadPlayerProject } from "./loadPlayerProject";

describe("loadPlayerProject", () => {
  it("外部 ProjectBundle 加载成功时使用外部项目", async () => {
    const project = { ...loadFallbackDemoProject(), id: "external-project", name: "外部项目" };
    const result = await loadPlayerProject(async () => ({
      ok: true,
      status: 200,
      text: async () => serializeProject(project)
    }));

    expect(result.source).toBe("external");
    expect(result.project.id).toBe("external-project");
  });

  it("外部 ProjectBundle 加载失败时回退 demo", async () => {
    const result = await loadPlayerProject(async () => ({
      ok: false,
      status: 404,
      text: async () => ""
    }));

    expect(result.source).toBe("demo");
    expect(result.project.id).toBe("demo-game");
  });

  it("外部项目校验失败时回退 demo", async () => {
    const badProject = { ...loadFallbackDemoProject(), startScriptId: "missing" };
    const result = await loadPlayerProject(async () => ({
      ok: true,
      status: 200,
      text: async () => serializeProject(badProject)
    }));

    expect(result.source).toBe("demo");
    expect(result.project.id).toBe("demo-game");
    expect(result.message).toContain("校验失败");
  });
});
