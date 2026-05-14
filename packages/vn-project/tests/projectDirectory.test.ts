import { describe, expect, it } from "vitest";
import { validateProject } from "@vn-engine/vn-schema";
import {
  createDefaultProject,
  mergeProjectScripts,
  normalizeProjectAssetPath,
  splitProjectScripts
} from "../src";

describe("project directory helpers", () => {
  it("合法相对素材路径可以写入项目 JSON", () => {
    expect(normalizeProjectAssetPath("assets/audio/bgm/main.mp3")).toEqual({
      ok: true,
      path: "assets/audio/bgm/main.mp3"
    });
    expect(normalizeProjectAssetPath(".\\assets\\background\\classroom.png").path).toBe("assets/background/classroom.png");
  });

  it("绝对路径和上级目录逃逸路径会被拒绝", () => {
    expect(normalizeProjectAssetPath("C:\\Users\\test\\main.mp3").ok).toBe(false);
    expect(normalizeProjectAssetPath("/Users/test/main.mp3").ok).toBe(false);
    expect(normalizeProjectAssetPath("../secret.txt").ok).toBe(false);
    expect(normalizeProjectAssetPath("assets/../secret.txt").ok).toBe(false);
  });

  it("splitProjectScripts 和 mergeProjectScripts 不丢失脚本节点", () => {
    const project = createDefaultProject({ id: "split-test" });
    const split = splitProjectScripts(project);
    expect(split.projectFile.scripts[0]?.path).toBe("scripts/start.vn.json");
    const merged = mergeProjectScripts(split.projectFile, split.scripts);
    expect(merged.scripts).toHaveLength(project.scripts.length);
    expect(merged.scripts[0]?.nodes[0]?.id).toBe(project.scripts[0]?.nodes[0]?.id);
  });

  it("默认项目可以通过 validateProject 校验", () => {
    expect(validateProject(createDefaultProject()).valid).toBe(true);
  });
});
