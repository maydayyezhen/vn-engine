import type { AnimationModule } from "../types/AnimationModule";
import { tween } from "../utils/animationTimeout";
import { numberParam } from "../utils/normalizeAnimationParams";

/** 物品居中展示。 */
export const propRevealCenter: AnimationModule = {
  id: "prop.revealCenter",
  name: "物品居中展示",
  category: "prop",
  description: "让指定物品在画面中央附近柔和显现。",
  tags: ["物品", "展示"],
  targetSlots: [{ key: "prop", label: "物品", type: "prop", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 500, min: 0, max: 3000, step: 50 },
    startScale: { type: "number", label: "起始缩放", default: 0.85, min: 0.1, max: 3, step: 0.01 },
    endScale: { type: "number", label: "结束缩放", default: 1, min: 0.1, max: 3, step: 0.01 }
  },
  async play(ctx, payload) {
    const propId = payload.targets.prop?.id;
    const sprite = propId ? ctx.getPropSprite(propId) : undefined;
    if (!sprite) {
      ctx.log(`动画 ${payload.animationId} 找不到物品目标：${propId ?? "(empty)"}`);
      return;
    }
    const durationMs = numberParam(payload.params, "durationMs", 500);
    const startScale = numberParam(payload.params, "startScale", 0.85);
    const endScale = numberParam(payload.params, "endScale", 1);
    const targetAlpha = sprite.alpha;
    const baseScaleX = Math.abs(sprite.scale.x);
    const baseScaleY = Math.abs(sprite.scale.y);
    const signX = sprite.scale.x < 0 ? -1 : 1;
    sprite.alpha = 0;
    sprite.scale.set(baseScaleX * startScale * signX, baseScaleY * startScale);
    await tween(durationMs, (progress) => {
      const scale = startScale + (endScale - startScale) * progress;
      sprite.alpha = targetAlpha * progress;
      sprite.scale.set(baseScaleX * scale * signX, baseScaleY * scale);
    });
    sprite.alpha = targetAlpha;
    sprite.scale.set(baseScaleX * endScale * signX, baseScaleY * endScale);
  }
};
