import { describe, expect, it } from "vitest";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import { resolveAudioState, resolveAudioResource } from "../src";

/** 创建 demo 工程。 */
function createProject(): VNProject {
  return JSON.parse(JSON.stringify(projectJson)) as VNProject;
}

/** 创建测试快照。 */
function createSnapshot(): RuntimeSnapshot {
  return {
    type: "dialogue",
    currentScriptId: "start",
    currentNodeId: "dialogue-greeting",
    backgroundAssetId: "bg-classroom",
    characters: [],
    speaker: "lincheng",
    text: "测试",
    choices: [],
    variables: {},
    audio: {
      bgm: "bgm-main-theme",
      sound: "sound-door",
      voice: "voice-lincheng-001"
    },
    isEnded: false
  };
}

describe("vn-audio resource resolving", () => {
  it("resolveAudioResource 能找到 BGM 资源", () => {
    const result = resolveAudioResource(createProject(), "bgm", "bgm-main-theme");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/bgm-demo.wav");
  });

  it("resolveAudioResource 能找到音效资源", () => {
    const result = resolveAudioResource(createProject(), "sound", "sound-door");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/sound-click.wav");
  });

  it("resolveAudioResource 能找到语音资源", () => {
    const result = resolveAudioResource(createProject(), "voice", "voice-lincheng-001");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/voice-lincheng-001.wav");
  });

  it("找不到资源时返回明确结果", () => {
    const result = resolveAudioResource(createProject(), "bgm", "missing-audio");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("音频资源不存在");
  });

  it("资源类型不匹配时返回明确结果", () => {
    const result = resolveAudioResource(createProject(), "bgm", "sound-door");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("不能用于 bgm 通道");
  });

  it("resolveAudioState 能从 snapshot 和 project 得到音频资源信息", () => {
    const resources = resolveAudioState(createSnapshot(), createProject());
    expect(resources.map((item) => item.channel)).toEqual(["bgm", "sound", "voice"]);
    expect(resources.every((item) => item.ok)).toBe(true);
  });
});
