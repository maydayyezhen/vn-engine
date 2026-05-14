import { describe, expect, it } from "vitest";
import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../examples/demo-game/scripts/start.vn.json";
import { VNRuntime } from "../src";

/** 创建覆盖 start、next、choice、jump 和条件分支的测试工程。 */
function createProject(): VNProject {
  return {
    id: "test-project",
    name: "测试工程",
    version: "0.1.0",
    startScriptId: "start",
    assets: { items: [] },
    characters: [{ id: "lin", name: "林澄" }],
    scripts: [
      {
        id: "start",
        name: "开始",
        nodes: [
          { id: "scene", type: "scene", backgroundAssetId: "classroom" },
          { id: "hello", type: "dialogue", characterId: "lin", text: "你来了。" },
          {
            id: "choice",
            type: "choice",
            prompt: "要留下吗？",
            options: [
              { id: "stay", text: "留下", setVariables: { stay: true }, target: { scriptId: "start", nodeId: "branch" } },
              { id: "leave", text: "离开", setVariables: { stay: false }, target: { scriptId: "start", nodeId: "branch" } }
            ]
          },
          {
            id: "branch",
            type: "condition",
            branches: [
              {
                id: "stay-branch",
                variable: "stay",
                operator: "equals",
                value: true,
                target: { scriptId: "ending", nodeId: "good" }
              }
            ],
            fallbackTarget: { scriptId: "ending", nodeId: "quiet" }
          }
        ]
      },
      {
        id: "ending",
        name: "结局",
        nodes: [
          { id: "good", type: "narration", text: "温柔的结尾。" },
          { id: "jump-end", type: "jump", target: { scriptId: "ending", nodeId: "quiet" } },
          { id: "quiet", type: "narration", text: "安静离开。" }
        ]
      }
    ]
  };
}

/** 创建与播放器一致的 demo 工程加载结果。 */
function createDemoProjectFromScriptFile(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}

describe("VNRuntime", () => {
  it("从起始脚本第一个可展示节点开始", () => {
    const runtime = new VNRuntime(createProject());
    const snapshot = runtime.start();
    expect(snapshot.type).toBe("dialogue");
    expect(snapshot.backgroundAssetId).toBe("classroom");
    expect(snapshot.currentNodeId).toBe("hello");
    expect(snapshot.text).toBe("你来了。");
  });

  it("next 推进到选项节点", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    const snapshot = runtime.next();
    expect(snapshot.type).toBe("choices");
    expect(snapshot.choices).toHaveLength(2);
  });

  it("choice 会写入变量并进入条件分支", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    runtime.next();
    const snapshot = runtime.choose("stay");
    expect(snapshot.currentScriptId).toBe("ending");
    expect(snapshot.currentNodeId).toBe("good");
    expect(snapshot.variables.stay).toBe(true);
  });

  it("条件不成立时进入 fallback 分支", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    runtime.next();
    const snapshot = runtime.choose("leave");
    expect(snapshot.currentNodeId).toBe("quiet");
    expect(snapshot.text).toBe("安静离开。");
  });

  it("jump 可以直接跳转到指定节点", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    const snapshot = runtime.jump("ending", "quiet");
    expect(snapshot.currentScriptId).toBe("ending");
    expect(snapshot.currentNodeId).toBe("quiet");
  });

  it("demo 工程文件可以直接通过 schema 校验", () => {
    const result = validateProject(projectJson as VNProject);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("播放器加载方式可以通过 schema 校验", () => {
    const result = validateProject(createDemoProjectFromScriptFile());
    expect(result.valid).toBe(true);
  });

  it("demo 的留下分支可以完整抵达结束状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    expect(runtime.start().currentNodeId).toBe("narration-intro");
    expect(runtime.next().currentNodeId).toBe("dialogue-greeting");
    expect(runtime.next().type).toBe("choices");
    expect(runtime.choose("stay").currentNodeId).toBe("ending-a");
    expect(runtime.next().currentNodeId).toBe("final-end");
    const ended = runtime.next();
    expect(ended.isEnded).toBe(true);
    expect(ended.currentNodeId).toBeNull();
  });

  it("demo 的离开分支可以完整抵达结束状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.next();
    runtime.next();
    expect(runtime.choose("leave").currentNodeId).toBe("ending-b");
    expect(runtime.next().currentNodeId).toBe("final-end");
    const ended = runtime.next();
    expect(ended.isEnded).toBe(true);
  });

  it("getState 和 loadState 可以恢复脚本、节点、变量、背景、角色、音频状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.next();
    runtime.next();
    const choiceSnapshot = runtime.choose("stay");
    const state = runtime.getState();

    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    const restoredSnapshot = restored.loadState(state);

    expect(restoredSnapshot.currentScriptId).toBe(choiceSnapshot.currentScriptId);
    expect(restoredSnapshot.currentNodeId).toBe(choiceSnapshot.currentNodeId);
    expect(restoredSnapshot.variables.stay).toBe(true);
    expect(restoredSnapshot.backgroundAssetId).toBe("bg-classroom");
    expect(restoredSnapshot.characters).toEqual([
      { characterId: "lincheng", assetId: "lincheng-normal", position: "center" }
    ]);
    expect(restoredSnapshot.audio.bgm).toBe("bgm-test");
  });
});
