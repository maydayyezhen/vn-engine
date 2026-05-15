import { describe, expect, it, vi } from "vitest";
import type { RuntimeActionEffect } from "@vn-engine/vn-core";
import { ActionPlayer, buildActionTimeline, getActionTimelineDuration, normalizeActionEasing } from "../src";

/** 创建测试动作。 */
function action(actionId: string, actionType: RuntimeActionEffect["actionType"], durationMs: number, parallelGroupId?: string): RuntimeActionEffect {
  return { actionId, actionType, durationMs, easing: "linear", parallelGroupId, payload: {} };
}

describe("action timeline helpers", () => {
  it("可以展开顺序动作 timeline", () => {
    const steps = buildActionTimeline([action("a", "wait", 100), action("b", "camera", 200)]);
    expect(steps).toHaveLength(2);
    expect(getActionTimelineDuration([action("a", "wait", 100), action("b", "camera", 200)])).toBe(300);
  });

  it("可以展开 parallel 动作 timeline", () => {
    const steps = buildActionTimeline([action("a", "moveCharacter", 100, "p1"), action("b", "camera", 300, "p1"), action("c", "wait", 50)]);
    expect(steps).toHaveLength(2);
    expect(steps[0].actions).toHaveLength(2);
    expect(steps[0].durationMs).toBe(300);
  });

  it("wait 动作时长和 easing 默认值可被规范化", () => {
    expect(buildActionTimeline([{ actionId: "wait", actionType: "wait", durationMs: 0, easing: "linear", payload: {} }])[0].durationMs).toBe(0);
    expect(normalizeActionEasing(undefined)).toBe("linear");
  });

  it("ActionPlayer 完成回调不直接推进 runtime", async () => {
    vi.useFakeTimers();
    const player = new ActionPlayer();
    const promise = player.play([action("a", "wait", 10)]);
    await vi.advanceTimersByTimeAsync(10);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
  it("ActionPlayer stop 会释放当前等待，避免悬挂 promise", async () => {
    vi.useFakeTimers();
    const player = new ActionPlayer();
    const promise = player.play([action("a", "wait", 1000)]);
    player.stop();
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
