import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 镜头柔和推进。 */
export const cameraSoftZoom: AnimationModule = {
  id: "camera.softZoom",
  name: "镜头柔和推进",
  category: "camera",
  description: "对背景和角色所在画面容器做一次柔和缩放。",
  tags: ["镜头", "缩放"],
  targetSlots: [{ key: "camera", label: "镜头", type: "camera", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 700, min: 0, max: 5000, step: 50 },
    zoom: { type: "number", label: "目标缩放", default: 1.06, min: 0.1, max: 3, step: 0.01 }
  },
  async play(ctx, payload) {
    const container = ctx.getCameraContainer();
    const durationMs = numberParam(payload.params, "durationMs", 700);
    const zoom = numberParam(payload.params, "zoom", 1.06);
    const originX = container.scale.x;
    const originY = container.scale.y;
    await tween(durationMs, (progress) => {
      const nextX = originX + (zoom - originX) * progress;
      const nextY = originY + (zoom - originY) * progress;
      container.scale.set(nextX, nextY);
    });
  }
};
