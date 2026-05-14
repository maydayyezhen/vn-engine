import { describe, expect, it } from "vitest";
import type { VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import { deserializeProject, PROJECT_FORMAT, serializeProject } from "../src";

/** 创建测试工程。 */
function createProject(): VNProject {
  return JSON.parse(JSON.stringify(projectJson)) as VNProject;
}

describe("vn-project serialization", () => {
  it("serializeProject 可以导出合法 JSON", () => {
    const json = serializeProject(createProject());
    const parsed = JSON.parse(json) as { format: string; project: VNProject };
    expect(parsed.format).toBe(PROJECT_FORMAT);
    expect(parsed.project.id).toBe("demo-game");
  });

  it("deserializeProject 可以读取 ProjectBundle 格式", () => {
    const json = serializeProject(createProject());
    const project = deserializeProject(json);
    expect(project.id).toBe("demo-game");
    expect(project.scripts.length).toBeGreaterThan(0);
  });

  it("deserializeProject 可以兼容裸 VNProject 格式", () => {
    const project = deserializeProject(JSON.stringify(createProject()));
    expect(project.id).toBe("demo-game");
  });

  it("非法 JSON 会抛出明确错误", () => {
    expect(() => deserializeProject("{bad json")).toThrow("JSON 解析失败");
  });

  it("不支持的 format 会抛出明确错误", () => {
    const json = JSON.stringify({ format: "other-project", project: createProject() });
    expect(() => deserializeProject(json)).toThrow("不支持的项目格式");
  });

  it("反序列化后的项目可以通过 validateProject 校验", () => {
    const project = deserializeProject(serializeProject(createProject()));
    expect(validateProject(project).valid).toBe(true);
  });

  it("带素材库和角色表情的项目可以导出并重新导入", () => {
    const source = createProject();
    const project = deserializeProject(serializeProject(source));
    expect(project.assets.items).toHaveLength(source.assets.items.length);
    expect(project.characters[0]?.expressions).toHaveLength(source.characters[0]?.expressions?.length);
    expect(project.characters[0]?.expressions?.[0]?.assetId).toBe(source.characters[0]?.expressions?.[0]?.assetId);
    expect(validateProject(project).valid).toBe(true);
  });
});
