import { Graphics } from "pixi.js";
import type { AnimationModule } from "../types/AnimationModule";
import { numberParam, stringParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 淡出至黑。 */
export const screenFadeToBlack: AnimationModule = {
  id: "screen.fadeToBlack",
  name: "淡出至黑",
  category: "screen",
  description: "黑色覆盖层渐入或渐出。",
  tags: ["屏幕", "淡入淡出"],
  targetSlots: [{ key: "screen", label: "屏幕", type: "screen", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 700, min: 0, max: 5000, step: 50 },
    direction: { type: "select", label: "方向", default: "in", options: [{ label: "变黑", value: "in" }, { label: "淡出黑幕", value: "out" }] },
    opacity: { type: "number", label: "黑幕透明度", default: 1, min: 0, max: 1, step: 0.05 }
  },
  async play(ctx, payload) {
    const { width, height } = ctx.getStageSize();
    const layer = ctx.getScreenEffectLayer();
    const durationMs = numberParam(payload.params, "durationMs", 700);
    const opacity = numberParam(payload.params, "opacity", 1);
    const direction = stringParam(payload.params, "direction", "in");
    const mask = new Graphics();
    mask.rect(0, 0, width, height);
    mask.fill({ color: 0x000000 });
    mask.alpha = direction === "out" ? opacity : 0;
    layer.addChild(mask);
    await tween(durationMs, (progress) => {
      mask.alpha = direction === "out" ? opacity * (1 - progress) : opacity * progress;
    });
    if (direction === "out") mask.destroy();
  }
};
