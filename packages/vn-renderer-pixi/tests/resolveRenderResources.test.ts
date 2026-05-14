import { describe, expect, it } from "vitest";
import { VNRuntime } from "@vn-engine/vn-core";
import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../examples/demo-game/scripts/start.vn.json";
import { resolveAudioResources, resolveBackgroundResource, resolveCharacterResources, resolveRenderResources } from "../src";

/** 创建 demo 工程数据。 */
function createProject(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}

/** 创建已启动的 demo 运行时快照。 */
function createStartedSnapshot() {
  const runtime = new VNRuntime(createProject());
  return runtime.start();
}

describe("resolveRenderResources", () => {
  it("能从 project 和 snapshot 解析背景资源", () => {
    const project = createProject();
    const background = resolveBackgroundResource(project, createStartedSnapshot());
    expect(background.assetId).toBe("bg-classroom");
    expect(background.name).toBe("教室背景");
    expect(background.path).toBe("/demo-assets/background/classroom.png");
    expect(background.exists).toBe(true);
  });

  it("能从 project 和 snapshot 解析角色表情资源", () => {
    const project = createProject();
    const runtime = new VNRuntime(project);
    runtime.start();
    const snapshot = runtime.next();
    const characters = resolveCharacterResources(project, snapshot);
    expect(characters[0]?.characterId).toBe("lincheng");
    expect(characters[0]?.expressionId).toBe("smile");
    expect(characters[0]?.assetId).toBe("lincheng-smile");
    expect(characters[0]?.exists).toBe(true);
  });

  it("找不到资源时返回可用于占位渲染的信息", () => {
    const project = createProject();
    const snapshot = {
      ...createStartedSnapshot(),
      backgroundAssetId: "missing-bg",
      characters: [{ characterId: "lincheng", expression: "missing-expression", position: "center" as const }]
    };
    const resources = resolveRenderResources(project, snapshot);
    expect(resources.background.exists).toBe(false);
    expect(resources.background.name).toBe("missing-bg");
    expect(resources.characters[0]?.exists).toBe(false);
    expect(resources.characters[0]?.expressionName).toBe("missing-expression");
  });

  it("音频资源只解析不播放", () => {
    const project = createProject();
    const audio = resolveAudioResources(project, createStartedSnapshot());
    expect(audio[0]?.channel).toBe("bgm");
    expect(audio[0]?.assetId).toBe("bgm-main-theme");
    expect(audio[0]?.path).toBe("/demo-assets/audio/bgm-demo.wav");
    expect(audio[0]?.exists).toBe(true);
  });
});
