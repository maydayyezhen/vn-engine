import type { AnimationModule } from "../types/AnimationModule";
import { tween } from "../utils/animationTimeout";
import { numberParam } from "../utils/normalizeAnimationParams";

/** 物品轻微漂浮。 */
export const propFloatOnce: AnimationModule = {
  id: "prop.floatOnce",
  name: "物品轻微漂浮",
  category: "prop",
  description: "让指定物品轻微上下浮动一次并回到原位。",
  tags: ["物品", "漂浮"],
  targetSlots: [{ key: "prop", label: "物品", type: "prop", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 700, min: 0, max: 3000, step: 50 },
    amplitude: { type: "number", label: "幅度", default: 18, min: 0, max: 120, step: 1 }
  },
  async play(ctx, payload) {
    const propId = payload.targets.prop?.id;
    const sprite = propId ? ctx.getPropSprite(propId) : undefined;
    if (!sprite) {
      ctx.log(`动画 ${payload.animationId} 找不到物品目标：${propId ?? "(empty)"}`);
      return;
    }
    const durationMs = numberParam(payload.params, "durationMs", 700);
    const amplitude = numberParam(payload.params, "amplitude", 18);
    const baseY = sprite.y;
    await tween(durationMs, (progress) => {
      sprite.y = baseY - Math.sin(progress * Math.PI) * amplitude;
    });
    sprite.y = baseY;
  }
};
