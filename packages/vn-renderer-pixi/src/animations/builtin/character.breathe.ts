import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 角色轻微呼吸。 */
export const characterBreathe: AnimationModule = {
  id: "character.breathe",
  name: "角色轻微呼吸",
  category: "character",
  description: "短暂改变角色缩放，形成一次轻微呼吸感。",
  tags: ["角色", "呼吸"],
  targetSlots: [{ key: "main", label: "角色", type: "character", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 900, min: 0, max: 5000, step: 50 },
    scaleDelta: { type: "number", label: "缩放变化", default: 0.025, min: 0, max: 0.2, step: 0.005 }
  },
  async play(ctx, payload) {
    const sprite = payload.targets.main?.id ? ctx.getCharacterSprite(payload.targets.main.id) : undefined;
    if (!sprite) return;
    const durationMs = numberParam(payload.params, "durationMs", 900);
    const scaleDelta = numberParam(payload.params, "scaleDelta", 0.025);
    const originX = sprite.scale.x;
    const originY = sprite.scale.y;
    await tween(durationMs, (progress) => {
      const wave = Math.sin(progress * Math.PI);
      sprite.scale.set(originX * (1 + wave * scaleDelta), originY * (1 + wave * scaleDelta));
    });
    sprite.scale.set(originX, originY);
  }
};
