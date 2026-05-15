import { Graphics } from "pixi.js";
import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 白色闪屏。 */
export const screenFlashWhite: AnimationModule = {
  id: "screen.flashWhite",
  name: "白色闪屏",
  category: "screen",
  description: "在屏幕上快速显示白色覆盖层并淡出。",
  tags: ["屏幕", "闪光"],
  targetSlots: [{ key: "screen", label: "屏幕", type: "screen", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 300, min: 0, max: 2000, step: 50 },
    intensity: { type: "number", label: "强度", default: 0.85, min: 0, max: 1, step: 0.05 }
  },
  async play(ctx, payload) {
    const { width, height } = ctx.getStageSize();
    const layer = ctx.getScreenEffectLayer();
    const durationMs = numberParam(payload.params, "durationMs", 300);
    const intensity = numberParam(payload.params, "intensity", 0.85);
    const flash = new Graphics();
    flash.rect(0, 0, width, height);
    flash.fill({ color: 0xffffff });
    flash.alpha = intensity;
    layer.addChild(flash);
    await tween(durationMs, (progress) => {
      flash.alpha = intensity * (1 - progress);
    });
    flash.destroy();
  }
};
