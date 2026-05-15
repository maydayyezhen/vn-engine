import type { AnimationModule } from "../types/AnimationModule";

/** custom 目录示例动画，默认不产生可见效果。 */
export const exampleCustomAnimation: AnimationModule = {
  id: "custom.exampleNoop",
  name: "自定义示例空动画",
  category: "screen",
  description: "用于说明 custom 动画模块如何注册；不会改变画面。",
  tags: ["示例"],
  targetSlots: [{ key: "screen", label: "屏幕", type: "screen", required: false }],
  paramsSchema: {
    durationMs: { type: "number", label: "等待时长", default: 100, min: 0, max: 1000, step: 50 }
  },
  async play(ctx, payload) {
    const duration = typeof payload.params.durationMs === "number" ? payload.params.durationMs : 100;
    ctx.log("执行 custom 示例空动画。");
    await ctx.wait(duration);
  }
};
