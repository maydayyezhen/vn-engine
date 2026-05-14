import { describe, expect, it } from "vitest";
import type { VNProject } from "@vn-engine/vn-schema";
import {
  addScript,
  createSafeScriptId,
  deleteScript,
  renameScript,
  setStartScript
} from "../src";

/** 创建用于脚本管理测试的最小项目。 */
function createProject(): VNProject {
  return {
    id: "project",
    name: "Project",
    version: "0.1.0",
    startScriptId: "start",
    assets: { items: [] },
    characters: [],
    scripts: [
      {
        id: "start",
        name: "Start",
        nodes: [{ id: "start_node", type: "narration", text: "start" }]
      }
    ]
  };
}

describe("script management", () => {
  it("generates unique script ids", () => {
    expect(createSafeScriptId("chapter", ["chapter", "chapter_2"])).toBe("chapter_3");
  });

  it("adds a script with placeholder node", () => {
    const result = addScript(createProject(), "Chapter");
    expect(result.script.id).toBe("chapter");
    expect(result.script.nodes).toHaveLength(1);
    expect(result.project.scripts).toHaveLength(2);
  });

  it("does not delete the last script", () => {
    const project = createProject();
    const result = deleteScript(project, "start");
    expect(result.project.scripts).toHaveLength(1);
    expect(result.selectedScriptId).toBe("start");
  });

  it("selects a new entry script after deleting the old entry", () => {
    const first = addScript(createProject(), "Chapter");
    const result = deleteScript(first.project, "start");
    expect(result.project.startScriptId).toBe("chapter");
    expect(result.selectedScriptId).toBe("chapter");
  });

  it("renames script without changing id", () => {
    const project = renameScript(createProject(), "start", "Renamed");
    expect(project.scripts[0].id).toBe("start");
    expect(project.scripts[0].name).toBe("Renamed");
  });

  it("sets start script", () => {
    const first = addScript(createProject(), "Chapter");
    const project = setStartScript(first.project, "chapter");
    expect(project.startScriptId).toBe("chapter");
  });
});
