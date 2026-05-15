import { Graphics } from "pixi.js";
import type { AnimationModule } from "../types/AnimationModule";
import { numberParam } from "../utils/normalizeAnimationParams";
import { tween } from "../utils/animationTimeout";

/** 雪花飘落。 */
export const particleSnow: AnimationModule = {
  id: "particle.snow",
  name: "雪花飘落",
  category: "particle",
  description: "生成少量简单雪花粒子，验证粒子层动画链路。",
  tags: ["粒子", "雪"],
  targetSlots: [{ key: "screen", label: "屏幕", type: "particle", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 1200, min: 0, max: 8000, step: 100 },
    count: { type: "number", label: "数量", default: 18, min: 1, max: 80, step: 1 },
    speed: { type: "number", label: "速度", default: 70, min: 10, max: 300, step: 5 }
  },
  async play(ctx, payload) {
    const { width, height } = ctx.getStageSize();
    const layer = ctx.getParticleLayer();
    const durationMs = numberParam(payload.params, "durationMs", 1200);
    const count = numberParam(payload.params, "count", 18);
    const speed = numberParam(payload.params, "speed", 70);
    const particles = Array.from({ length: Math.max(1, Math.floor(count)) }, (_, index) => {
      const dot = new Graphics();
      dot.circle(0, 0, 2 + (index % 3));
      dot.fill({ color: 0xffffff, alpha: 0.8 });
      dot.x = (index * 97) % width;
      dot.y = -20 - ((index * 31) % 180);
      layer.addChild(dot);
      return dot;
    });
    await tween(durationMs, (progress) => {
      particles.forEach((dot, index) => {
        dot.y = -20 - ((index * 31) % 180) + progress * speed * 6;
        dot.x += Math.sin(progress * Math.PI * 2 + index) * 0.4;
        if (dot.y > height + 20) dot.y -= height + 80;
      });
    });
    particles.forEach((dot) => dot.destroy());
  }
};
