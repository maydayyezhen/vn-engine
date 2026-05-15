import { describe, expect, it } from "vitest";
import { VNRuntime } from "@vn-engine/vn-core";
import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../examples/demo-game/scripts/start.vn.json";
import { resolveAudioResources, resolveBackgroundResource, resolveCharacterResources, resolveRenderResources } from "../src";
import { normalizeCameraState, normalizeTransition, resolveCharacterLayout, resolveCharacterX, sortCharactersByZIndex } from "../src/utils/presentationLayout";

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
      pendingEffects: [],
      characters: [
        {
          characterId: "lincheng",
          expression: "missing-expression",
          position: "center" as const,
          scale: 1,
          opacity: 1,
          zIndex: 0,
          flipX: false,
          enterEffect: "none" as const,
          transitionDurationMs: 300
        }
      ]
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

describe("presentation layout helpers", () => {
  it("计算 left/center/right/custom 角色横坐标", () => {
    expect(resolveCharacterX("left", 1000)).toBe(280);
    expect(resolveCharacterX("center", 1000)).toBe(500);
    expect(resolveCharacterX("right", 1000)).toBe(720);
    expect(resolveCharacterX("custom", 1000, 123)).toBe(123);
  });

  it("按 zIndex 排序角色并处理默认布局值", () => {
    const project = createProject();
    const runtime = new VNRuntime(project);
    runtime.start();
    const resources = resolveCharacterResources(project, runtime.next());
    const layout = resolveCharacterLayout(resources[0], { width: 1280, height: 720 });

    expect(sortCharactersByZIndex([{ ...resources[0], zIndex: 2 }, { ...resources[0], characterId: "b", zIndex: 1 }]).map((item) => item.zIndex)).toEqual([1, 2]);
    expect(layout.scale).toBe(1.05);
    expect(layout.opacity).toBe(1);
  });

  it("解析转场和镜头状态", () => {
    expect(normalizeTransition("fade", 600)).toEqual({ type: "fade", durationMs: 600 });
    expect(normalizeCameraState({ zoom: 1.2, offsetX: 4, offsetY: 5, shake: true, shakeIntensity: 8, durationMs: 300 })).toEqual({
      zoom: 1.2,
      offsetX: 4,
      offsetY: 5,
      shake: true,
      shakeIntensity: 8,
      durationMs: 300
    });
  });
});

describe("one-shot background effects", () => {
  it("普通背景静态状态不会携带转场动画", () => {
    const project = createProject();
    const snapshot = {
      ...createStartedSnapshot(),
      pendingEffects: [],
      background: {
        assetId: "bg-classroom",
        transition: "fade" as const,
        transitionDurationMs: 600
      }
    };
    const background = resolveBackgroundResource(project, snapshot);
    expect(background.transition).toBe("none");
    expect(background.effectId).toBeUndefined();
  });

  it("pendingEffects 中的一次性背景转场会驱动背景动画", () => {
    const project = createProject();
    const snapshot = {
      ...createStartedSnapshot(),
      pendingEffects: [
        {
          id: "effect-bg-1",
          type: "backgroundTransition" as const,
          backgroundAssetId: "bg-classroom",
          transition: "fade" as const,
          transitionDurationMs: 600
        }
      ],
      background: { assetId: "bg-classroom" }
    };
    const background = resolveBackgroundResource(project, snapshot);
    expect(background).toMatchObject({
      effectId: "effect-bg-1",
      assetId: "bg-classroom",
      transition: "fade",
      transitionDurationMs: 600
    });
  });
});

describe("one-shot character effects", () => {
  it("普通角色静态状态不会携带入场动画", () => {
    const project = createProject();
    const snapshot = {
      ...createStartedSnapshot(),
      pendingEffects: [],
      characters: [
        {
          characterId: "lincheng",
          expression: "smile",
          position: "center" as const,
          scale: 1,
          opacity: 1,
          zIndex: 0,
          flipX: false,
          enterEffect: "slideInLeft" as const,
          transitionDurationMs: 600
        }
      ]
    };
    const characters = resolveCharacterResources(project, snapshot);
    expect(characters[0]?.enterEffect).toBe("none");
    expect(characters[0]?.effectId).toBeUndefined();
  });

  it("pendingEffects 中的一次性入场动画会覆盖同角色静态状态", () => {
    const project = createProject();
    const snapshot = {
      ...createStartedSnapshot(),
      characters: [
        {
          characterId: "lincheng",
          expression: "smile",
          position: "center" as const,
          scale: 1,
          opacity: 1,
          zIndex: 0,
          flipX: false
        }
      ],
      pendingEffects: [
        {
          id: "effect-enter-1",
          type: "showCharacter" as const,
          characterId: "lincheng",
          enterEffect: "slideInLeft" as const,
          transitionDurationMs: 600,
          character: {
            characterId: "lincheng",
            expression: "smile",
            position: "left" as const,
            scale: 1,
            opacity: 1,
            zIndex: 0,
            flipX: false,
            enterEffect: "slideInLeft" as const,
            transitionDurationMs: 600
          }
        }
      ]
    };
    const characters = resolveCharacterResources(project, snapshot);
    expect(characters).toHaveLength(1);
    expect(characters[0]).toMatchObject({
      effectId: "effect-enter-1",
      characterId: "lincheng",
      enterEffect: "slideInLeft",
      position: "left"
    });
  });
});
