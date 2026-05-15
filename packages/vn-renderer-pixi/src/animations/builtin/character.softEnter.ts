import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 角色柔和入场。 */
export const characterSoftEnter: AnimationModule = {
  id: "character.softEnter",
  name: "角色柔和入场",
  category: "character",
  description: "让指定角色从轻微偏移、透明和缩小状态过渡到当前位置。",
  tags: ["角色", "入场"],
  targetSlots: [{ key: "main", label: "角色", type: "character", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 700, min: 0, max: 3000, step: 50 },
    offsetX: { type: "number", label: "起始横向偏移", default: -120, min: -600, max: 600, step: 10 },
    startScale: { type: "number", label: "起始缩放", default: 0.94, min: 0.1, max: 3, step: 0.01 },
    endScale: { type: "number", label: "结束缩放", default: 1, min: 0.1, max: 3, step: 0.01 }
  },
  async play(ctx, payload) {
    const characterId = payload.targets.main?.id;
    const sprite = characterId ? ctx.getCharacterSprite(characterId) : undefined;
    if (!sprite) {
      ctx.log(`动画 ${payload.animationId} 找不到角色目标：${characterId ?? "(empty)"}`);
      return;
    }
    const durationMs = numberParam(payload.params, "durationMs", 700);
    const offsetX = numberParam(payload.params, "offsetX", -120);
    const startScale = numberParam(payload.params, "startScale", 0.94);
    const endScale = numberParam(payload.params, "endScale", 1);
    const targetX = sprite.x;
    const targetAlpha = sprite.alpha;
    const baseScaleX = sprite.scale.x;
    const baseScaleY = sprite.scale.y;
    sprite.x = targetX + offsetX;
    sprite.alpha = 0;
    sprite.scale.set(baseScaleX * startScale, baseScaleY * startScale);
    await tween(durationMs, (progress) => {
      sprite.x = targetX + offsetX * (1 - progress);
      sprite.alpha = targetAlpha * progress;
      const scale = startScale + (endScale - startScale) * progress;
      sprite.scale.set(baseScaleX * scale, baseScaleY * scale);
    });
    sprite.x = targetX;
    sprite.alpha = targetAlpha;
    sprite.scale.set(baseScaleX * endScale, baseScaleY * endScale);
  }
};
