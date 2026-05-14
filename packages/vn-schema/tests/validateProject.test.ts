import { describe, expect, it } from "vitest";
import type { VNProject } from "../src";
import { validateProject } from "../src";
import projectJson from "../../../examples/demo-game/project.vnproj.json";

/** 创建测试工程副本。 */
function createProject(): VNProject {
  return JSON.parse(JSON.stringify(projectJson)) as VNProject;
}

/** 判断错误信息是否包含关键字。 */
function hasError(project: VNProject, keyword: string): boolean {
  return validateProject(project).errors.some((error) => error.message.includes(keyword));
}

describe("validateProject resource references", () => {
  it("背景资源引用有效时校验通过", () => {
    expect(validateProject(createProject()).valid).toBe(true);
  });

  it("背景资源引用不存在时校验报错", () => {
    const project = createProject();
    const scene = project.scripts[0]?.nodes.find((node) => node.type === "scene");
    if (scene?.type === "scene") scene.backgroundAssetId = "missing-background";
    expect(hasError(project, "背景素材不存在")).toBe(true);
  });

  it("角色引用不存在时校验报错", () => {
    const project = createProject();
    const show = project.scripts[0]?.nodes.find((node) => node.type === "showCharacter");
    if (show?.type === "showCharacter") show.characterId = "missing-character";
    expect(hasError(project, "角色不存在")).toBe(true);
  });

  it("角色表情不存在时校验报错", () => {
    const project = createProject();
    const show = project.scripts[0]?.nodes.find((node) => node.type === "showCharacter");
    if (show?.type === "showCharacter") show.expression = "missing-expression";
    expect(hasError(project, "不存在表情")).toBe(true);
  });

  it("表情引用素材不存在时校验报错", () => {
    const project = createProject();
    const expression = project.characters[0]?.expressions?.[0];
    if (expression) expression.assetId = "missing-asset";
    expect(hasError(project, "引用的素材不存在")).toBe(true);
  });

  it("音频资源引用不存在时校验报错", () => {
    const project = createProject();
    const audio = project.scripts[0]?.nodes.find((node) => node.type === "playAudio");
    if (audio?.type === "playAudio") audio.assetId = "missing-audio";
    expect(hasError(project, "音频素材不存在")).toBe(true);
  });

  it("重复素材 id 会报错", () => {
    const project = createProject();
    project.assets.items.push({ ...project.assets.items[0] });
    expect(hasError(project, "素材 id 重复")).toBe(true);
  });

  it("重复角色 id 会报错", () => {
    const project = createProject();
    project.characters.push({ ...project.characters[0], expressions: [] });
    expect(hasError(project, "角色 id 重复")).toBe(true);
  });
});
