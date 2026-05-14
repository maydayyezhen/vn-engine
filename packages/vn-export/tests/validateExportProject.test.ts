import { describe, expect, it } from "vitest";
import { validateExportProject } from "../src";
import { createExportTestProject } from "./testProject";

describe("validateExportProject", () => {
  it("能发现空资源路径", () => {
    const project = createExportTestProject();
    project.assets.items[0] = { ...project.assets.items[0], path: "" };
    const result = validateExportProject(project);
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes("路径为空"))).toBe(true);
  });

  it("能发现危险路径", () => {
    const project = createExportTestProject();
    project.assets.items[0] = { ...project.assets.items[0], path: "../../file.txt" };
    const result = validateExportProject(project);
    expect(result.valid).toBe(false);
    expect(result.errors.some((message) => message.includes("不能导出"))).toBe(true);
  });
});
