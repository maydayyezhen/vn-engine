import { describe, expect, it } from "vitest";
import { AnimationRegistry, builtinAnimations, createDefaultAnimationRegistry, normalizeAnimationParams } from "../src";

describe("AnimationRegistry", () => {
  it("能注册并列出内置动画模块", () => {
    const registry = createDefaultAnimationRegistry();
    expect(registry.get("character.softEnter")?.name).toBe("角色柔和入场");
    expect(registry.get("camera.softZoom")?.category).toBe("camera");
    expect(registry.list().length).toBeGreaterThanOrEqual(builtinAnimations.length);
  });

  it("重复 id 注册会报错", () => {
    const registry = new AnimationRegistry();
    registry.register(builtinAnimations[0]);
    expect(() => registry.register(builtinAnimations[0])).toThrow("动画 id 重复");
  });

  it("可以按 category 列出动画", () => {
    const registry = createDefaultAnimationRegistry();
    expect(registry.listByCategory("character").every((animation) => animation.category === "character")).toBe(true);
  });

  it("缺失动画 id 时返回 undefined", () => {
    expect(createDefaultAnimationRegistry().get("missing.animation")).toBeUndefined();
  });

  it("paramsSchema 默认值可以与节点参数合并", () => {
    const animation = createDefaultAnimationRegistry().get("character.softEnter");
    expect(animation).toBeTruthy();
    const params = normalizeAnimationParams(animation!.paramsSchema, { offsetX: -80 });
    expect(params.durationMs).toBe(700);
    expect(params.offsetX).toBe(-80);
  });
});
