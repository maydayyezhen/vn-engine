import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 角色紧张轻抖。 */
export const characterNervousShake: AnimationModule = {
  id: "character.nervousShake",
  name: "角色紧张轻抖",
  category: "character",
  description: "让角色在原位置左右轻微抖动，结束后回到原点。",
  tags: ["角色", "抖动"],
  targetSlots: [{ key: "main", label: "角色", type: "character", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 500, min: 0, max: 3000, step: 50 },
    amplitude: { type: "number", label: "幅度", default: 8, min: 0, max: 80, step: 1 },
    repeat: { type: "number", label: "次数", default: 5, min: 1, max: 20, step: 1 }
  },
  async play(ctx, payload) {
    const sprite = payload.targets.main?.id ? ctx.getCharacterSprite(payload.targets.main.id) : undefined;
    if (!sprite) return;
    const durationMs = numberParam(payload.params, "durationMs", 500);
    const amplitude = numberParam(payload.params, "amplitude", 8);
    const repeat = numberParam(payload.params, "repeat", 5);
    const originX = sprite.x;
    await tween(durationMs, (progress) => {
      sprite.x = originX + Math.sin(progress * Math.PI * 2 * repeat) * amplitude;
    });
    sprite.x = originX;
  }
};
