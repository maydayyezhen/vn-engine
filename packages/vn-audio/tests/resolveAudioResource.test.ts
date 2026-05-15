import { describe, expect, it } from "vitest";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import { resolveAudioResource, resolveAudioState, syncAudioState } from "../src";

function createProject(): VNProject {
  return JSON.parse(JSON.stringify(projectJson)) as VNProject;
}

function createSnapshot(): RuntimeSnapshot {
  return {
    type: "dialogue",
    currentScriptId: "start",
    currentNodeId: "dialogue-greeting",
    backgroundAssetId: "bg-classroom",
    background: { assetId: "bg-classroom", transition: "none", transitionDurationMs: 300 },
    characters: [],
    props: [],
    camera: { zoom: 1, offsetX: 0, offsetY: 0, shake: false, shakeIntensity: 0, durationMs: 0 },
    pendingEffects: [],
    pendingActions: [],
    pendingAnimations: [],
    speaker: "lincheng",
    text: "test",
    choices: [],
    variables: {},
    debugLog: [],
    audio: {
      bgm: "bgm-main-theme",
      sound: "sound-door",
      voice: "voice-lincheng-001"
    },
    isWaitingForActionCompletion: false,
    isEnded: false
  };
}

describe("vn-audio resource resolving", () => {
  it("resolves a BGM resource", () => {
    const result = resolveAudioResource(createProject(), "bgm", "bgm-main-theme");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/bgm-demo.wav");
  });

  it("resolves a sound resource", () => {
    const result = resolveAudioResource(createProject(), "sound", "sound-door");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/sound-click.wav");
  });

  it("resolves a voice resource", () => {
    const result = resolveAudioResource(createProject(), "voice", "voice-lincheng-001");
    expect(result.ok).toBe(true);
    expect(result.path).toBe("/demo-assets/audio/voice-lincheng-001.wav");
  });

  it("returns a clear result when a resource is missing", () => {
    const result = resolveAudioResource(createProject(), "bgm", "missing-audio");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("missing-audio");
  });

  it("returns a clear result when a resource type does not match the channel", () => {
    const result = resolveAudioResource(createProject(), "bgm", "sound-door");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("bgm");
  });

  it("resolves audio state from a snapshot and project", () => {
    const resources = resolveAudioState(createSnapshot(), createProject());
    expect(resources.map((item) => item.channel)).toEqual(["bgm", "sound", "voice"]);
    expect(resources.every((item) => item.ok)).toBe(true);
  });

  it("skips play when the channel already uses the same asset", async () => {
    const snapshot = createSnapshot();
    snapshot.audio = { bgm: "bgm-main-theme" };
    const played: string[] = [];
    const stopped: string[] = [];
    const audioManager = {
      getCurrentAssetId: (channel: string) => channel === "bgm" ? "bgm-main-theme" : undefined,
      play: async ({ assetId }: { assetId: string }) => {
        played.push(assetId);
      },
      stop: (channel: string) => {
        stopped.push(channel);
      }
    };

    await syncAudioState(snapshot, createProject(), audioManager as never);

    expect(played).toEqual([]);
    expect(stopped).toEqual(["sound", "voice"]);
  });
});
