import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 镜头轻微震动。 */
export const cameraShakeLight: AnimationModule = {
  id: "camera.shakeLight",
  name: "镜头轻微震动",
  category: "camera",
  description: "短暂轻微晃动画面容器，结束后回到原位置。",
  tags: ["镜头", "震动"],
  targetSlots: [{ key: "camera", label: "镜头", type: "camera", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 350, min: 0, max: 3000, step: 50 },
    amplitude: { type: "number", label: "幅度", default: 8, min: 0, max: 80, step: 1 },
    repeat: { type: "number", label: "次数", default: 5, min: 1, max: 20, step: 1 }
  },
  async play(ctx, payload) {
    const container = ctx.getCameraContainer();
    const durationMs = numberParam(payload.params, "durationMs", 350);
    const amplitude = numberParam(payload.params, "amplitude", 8);
    const repeat = numberParam(payload.params, "repeat", 5);
    const originX = container.x;
    const originY = container.y;
    await tween(durationMs, (progress) => {
      container.x = originX + Math.sin(progress * Math.PI * 2 * repeat) * amplitude;
      container.y = originY + Math.cos(progress * Math.PI * 2 * repeat) * amplitude * 0.35;
    });
    container.position.set(originX, originY);
  }
};
