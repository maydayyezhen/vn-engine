import type { AnimationModule } from "../types/AnimationModule";
import { tween } from "../utils/animationTimeout";
import { numberParam } from "../utils/normalizeAnimationParams";

/** 物品淡出。 */
export const propFadeOut: AnimationModule = {
  id: "prop.fadeOut",
  name: "物品淡出",
  category: "prop",
  description: "让指定物品从当前透明度淡出。",
  tags: ["物品", "退场"],
  targetSlots: [{ key: "prop", label: "物品", type: "prop", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 350, min: 0, max: 3000, step: 50 }
  },
  async play(ctx, payload) {
    const propId = payload.targets.prop?.id;
    const sprite = propId ? ctx.getPropSprite(propId) : undefined;
    if (!sprite) {
      ctx.log(`动画 ${payload.animationId} 找不到物品目标：${propId ?? "(empty)"}`);
      return;
    }
    const durationMs = numberParam(payload.params, "durationMs", 350);
    const startAlpha = sprite.alpha;
    await tween(durationMs, (progress) => {
      sprite.alpha = startAlpha * (1 - progress);
    });
    sprite.alpha = 0;
  }
};
