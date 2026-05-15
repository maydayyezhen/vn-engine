import { describe, expect, it } from "vitest";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import { PixiVNRenderer } from "../src";
import type { AnimationModule } from "../src";

function createWaitingAnimationSnapshot(): RuntimeSnapshot {
  return {
    type: "action",
    currentScriptId: "start",
    currentNodeId: "anim-flash",
    backgroundAssetId: undefined,
    background: undefined,
    characters: [],
    props: [],
    camera: { zoom: 1, offsetX: 0, offsetY: 0, shake: false, shakeIntensity: 0, durationMs: 0 },
    pendingEffects: [],
    pendingActions: [],
    pendingAnimations: [
      {
        effectId: "effect-flash",
        animationId: "test.flash",
        targets: { screen: { type: "screen" } },
        params: {},
        waitForCompletion: true,
        autoNext: true
      }
    ],
    speaker: null,
    text: "animation: test.flash",
    choices: [],
    variables: {},
    debugLog: [],
    audio: {},
    isWaitingForActionCompletion: true,
    isEnded: false
  };
}

describe("PixiVNRenderer pending animation coordination", () => {
  it("keeps the completion callback alive when the same waiting snapshot renders again", async () => {
    let resolveAnimation: (() => void) | undefined;
    let playCount = 0;
    let completeCount = 0;
    const renderer = new PixiVNRenderer({
      onAnimationComplete: () => {
        completeCount += 1;
      }
    });
    const animation: AnimationModule = {
      id: "test.flash",
      name: "Test flash",
      category: "screen",
      targetSlots: [{ key: "screen", label: "Screen", type: "screen", required: true }],
      paramsSchema: {},
      play: async () => {
        playCount += 1;
        await new Promise<void>((resolve) => {
          resolveAnimation = resolve;
        });
      }
    };

    (renderer as unknown as { animationRegistry: { register: (animation: AnimationModule) => void } }).animationRegistry.register(animation);
    const playPendingAnimations = (renderer as unknown as { playPendingAnimations: (snapshot: RuntimeSnapshot) => void }).playPendingAnimations.bind(renderer);
    const snapshot = createWaitingAnimationSnapshot();

    playPendingAnimations(snapshot);
    playPendingAnimations(snapshot);
    expect(playCount).toBe(1);

    resolveAnimation?.();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(completeCount).toBe(1);
  });
});
