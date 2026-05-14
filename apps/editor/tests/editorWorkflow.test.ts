import { describe, expect, it } from "vitest";
import type { VNProject } from "@vn-engine/vn-schema";
import { clearClipboard, copyNode, cutNode, pasteNodeAfter } from "../src/services/nodeClipboardService";
import { moveNodeDown, moveNodeUp } from "../src/services/nodeOrderService";
import { filterNodes, searchProjectNodes } from "../src/services/nodeSearchService";
import { recordHistory, redoHistory, undoHistory, type EditorHistoryState } from "../src/services/editorHistoryService";

function createProject(): VNProject {
  return {
    id: "test-project",
    name: "Test Project",
    version: "0.1.0",
    startScriptId: "start",
    assets: { items: [] },
    characters: [],
    scripts: [
      {
        id: "start",
        name: "Start",
        nodes: [
          { type: "narration", id: "n1", text: "Opening line" },
          { type: "dialogue", id: "d1", characterId: "hero", text: "Hello world" },
          { type: "jump", id: "j1", target: { scriptId: "extra", nodeId: "e1" } }
        ]
      },
      {
        id: "extra",
        name: "Extra",
        nodes: [{ type: "narration", id: "e1", text: "Extra line" }]
      }
    ]
  };
}

describe("editor node ordering", () => {
  it("moves a node up and keeps its id", () => {
    const project = createProject();
    const next = moveNodeUp(project, "start", "d1");

    expect(next.scripts[0].nodes.map((node) => node.id)).toEqual(["d1", "n1", "j1"]);
  });

  it("moves a node down and keeps its id", () => {
    const project = createProject();
    const next = moveNodeDown(project, "start", "n1");

    expect(next.scripts[0].nodes.map((node) => node.id)).toEqual(["d1", "n1", "j1"]);
  });
});

describe("editor node clipboard", () => {
  it("copies and pastes a node with a new id", () => {
    clearClipboard();
    const project = createProject();

    expect(copyNode(project, "start", "j1")).toBe(true);
    const result = pasteNodeAfter(project, "extra", "e1");

    expect(result.ok).toBe(true);
    expect(result.nodeId).not.toBe("j1");
    expect(result.project.scripts[1].nodes).toHaveLength(2);
    expect(result.project.scripts[1].nodes[1]).toMatchObject({
      type: "jump",
      target: { scriptId: "extra", nodeId: "e1" }
    });
  });

  it("cuts a node and removes it from the source script", () => {
    clearClipboard();
    const project = createProject();
    const result = cutNode(project, "start", "d1");

    expect(result.ok).toBe(true);
    expect(result.project.scripts[0].nodes.map((node) => node.id)).toEqual(["n1", "j1"]);
  });
});

describe("editor history", () => {
  it("undoes and redoes project snapshots", () => {
    const state: EditorHistoryState = { undoStack: [], redoStack: [], maxLength: 2 };
    const first = { project: createProject(), selectedScriptId: "start", selectedNodeId: "n1" };
    const second = { project: moveNodeDown(createProject(), "start", "n1"), selectedScriptId: "start", selectedNodeId: "n1" };

    recordHistory(state, first);
    const undo = undoHistory(state, second);

    expect(undo).toEqual(first);
    expect(state.redoStack).toEqual([second]);
    expect(redoHistory(state, first)).toEqual(second);
  });

  it("drops old records after the history limit", () => {
    const state: EditorHistoryState = { undoStack: [], redoStack: [], maxLength: 2 };
    const base = createProject();

    recordHistory(state, { project: base, selectedScriptId: "start", selectedNodeId: "n1" });
    recordHistory(state, { project: moveNodeDown(base, "start", "n1"), selectedScriptId: "start", selectedNodeId: "n1" });
    recordHistory(state, { project: moveNodeUp(base, "start", "j1"), selectedScriptId: "start", selectedNodeId: "j1" });

    expect(state.undoStack.map((item) => item.selectedNodeId)).toEqual(["n1", "j1"]);
  });
});

describe("editor node search", () => {
  it("searches dialogue and narration text", () => {
    const project = createProject();

    expect(searchProjectNodes(project, { query: "hello", type: "all" }).map((item) => ({ scriptId: item.scriptId, nodeId: item.node.id }))).toEqual([
      { scriptId: "start", nodeId: "d1" }
    ]);
    expect(searchProjectNodes(project, { query: "opening", type: "all" }).map((item) => ({ scriptId: item.scriptId, nodeId: item.node.id }))).toEqual([
      { scriptId: "start", nodeId: "n1" }
    ]);
  });

  it("filters by node type", () => {
    const project = createProject();

    expect(filterNodes(project, project.scripts[0].nodes, { query: "", type: "dialogue" }).map((node) => node.id)).toEqual(["d1"]);
  });
});
