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

describe("validateProject presentation fields", () => {
  it("合法 transition 可以通过校验", () => {
    const project = createProject();
    const scene = project.scripts[0]?.nodes.find((node) => node.type === "scene");
    if (scene?.type === "scene") scene.transition = "fade";
    expect(validateProject(project).valid).toBe(true);
  });

  it("非法 transition 会报错", () => {
    const project = createProject();
    const scene = project.scripts[0]?.nodes.find((node) => node.type === "scene");
    if (scene?.type === "scene") scene.transition = "bad" as never;
    expect(hasError(project, "背景转场类型非法")).toBe(true);
  });

  it("非法 duration 会报错", () => {
    const project = createProject();
    const scene = project.scripts[0]?.nodes.find((node) => node.type === "scene");
    if (scene?.type === "scene") scene.transitionDurationMs = 9000;
    expect(hasError(project, "背景转场时长")).toBe(true);
  });

  it("非法 scale 会报错", () => {
    const project = createProject();
    const show = project.scripts[0]?.nodes.find((node) => node.type === "showCharacter");
    if (show?.type === "showCharacter") show.scale = 0;
    expect(hasError(project, "角色缩放")).toBe(true);
  });

  it("非法 opacity 会报错", () => {
    const project = createProject();
    const show = project.scripts[0]?.nodes.find((node) => node.type === "showCharacter");
    if (show?.type === "showCharacter") show.opacity = 2;
    expect(hasError(project, "角色透明度")).toBe(true);
  });

  it("custom 位置缺少 x/y 会给警告", () => {
    const project = createProject();
    const show = project.scripts[0]?.nodes.find((node) => node.type === "showCharacter");
    if (show?.type === "showCharacter") {
      show.position = "custom";
      delete show.x;
      delete show.y;
    }
    expect(validateProject(project).warnings.some((warning) => warning.message.includes("自定义角色位置"))).toBe(true);
  });

  it("CameraNode 数值异常会报错或警告", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "bad-camera", type: "camera", zoom: 0, shakeIntensity: 200 });
    const result = validateProject(project);
    expect(result.errors.some((error) => error.message.includes("镜头缩放"))).toBe(true);
    expect(result.warnings.some((warning) => warning.message.includes("镜头震动强度"))).toBe(true);
  });
});

describe("validateProject logic fields", () => {
  it("变量定义合法时可以通过校验", () => {
    const project = createProject();
    expect(validateProject(project).valid).toBe(true);
  });

  it("变量名重复会报错", () => {
    const project = createProject();
    project.variables = [...(project.variables ?? []), { name: "affection", type: "number", defaultValue: 0 }];
    expect(hasError(project, "变量名重复")).toBe(true);
  });

  it("变量名非法会报错", () => {
    const project = createProject();
    project.variables = [...(project.variables ?? []), { name: "1bad", type: "string", defaultValue: "" }];
    expect(hasError(project, "变量名非法")).toBe(true);
  });

  it("默认值类型不匹配会报错", () => {
    const project = createProject();
    project.variables = [...(project.variables ?? []), { name: "badDefault", type: "number", defaultValue: "0" }];
    expect(hasError(project, "默认值类型")).toBe(true);
  });

  it("SetVariableNode 引用未定义变量会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "set-missing", type: "setVariable", variableName: "missing", value: true });
    expect(hasError(project, "变量赋值引用未定义变量")).toBe(true);
  });

  it("add/subtract 用于非 number 变量会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "set-bad-op", type: "setVariable", variableName: "stayed", operator: "add", value: 1 });
    expect(hasError(project, "add/subtract")).toBe(true);
  });

  it("条件引用未定义变量会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({
      id: "condition-missing",
      type: "condition",
      condition: { kind: "variable", variableName: "missing", operator: "eq", value: true },
      trueTarget: { scriptId: "start", nodeId: "final-end" }
    });
    expect(hasError(project, "条件引用未定义变量")).toBe(true);
  });

  it("条件比较值类型不匹配会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({
      id: "condition-bad-value",
      type: "condition",
      condition: { kind: "variable", variableName: "affection", operator: "gte", value: "2" },
      trueTarget: { scriptId: "start", nodeId: "final-end" }
    });
    expect(hasError(project, "比较值类型")).toBe(true);
  });

  it("标签重复会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "dup-label", type: "label", name: "final_end" });
    expect(hasError(project, "标签名重复")).toBe(true);
  });

  it("跳转到不存在标签会报错", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "jump-missing-label", type: "jump", target: { scriptId: "start", label: "missing_label" } });
    expect(hasError(project, "标签不存在")).toBe(true);
  });

  it("跳转到存在标签可以通过", () => {
    const project = createProject();
    project.scripts[0].nodes.push({ id: "jump-existing-label", type: "jump", target: { scriptId: "start", label: "final_end" } });
    expect(validateProject(project).valid).toBe(true);
  });
});
