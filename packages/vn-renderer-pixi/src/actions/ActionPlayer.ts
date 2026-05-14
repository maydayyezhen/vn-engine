import type { RuntimeActionEffect } from "@vn-engine/vn-core";
import { buildActionTimeline } from "./actionTimeline";

/** 轻量动作播放协调器，负责等待动作序列时长并通知完成。 */
export class ActionPlayer {
  /** 当前播放令牌，用于中止旧动作序列。 */
  private token = 0;
  /** 当前定时器。 */
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** 播放动作序列，当前阶段由各渲染层负责视觉变化，本类负责顺序/并行等待。 */
  async play(actions: RuntimeActionEffect[]): Promise<void> {
    this.stop();
    const token = this.token;
    for (const step of buildActionTimeline(actions)) {
      if (token !== this.token) return;
      await this.wait(step.durationMs, token);
    }
  }

  /** 停止当前动作序列。 */
  stop(): void {
    this.token += 1;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** 销毁播放器。 */
  destroy(): void {
    this.stop();
  }

  /** 等待指定毫秒数。 */
  private wait(durationMs: number, token: number): Promise<void> {
    if (durationMs <= 0) return Promise.resolve();
    return new Promise((resolve) => {
      this.timer = setTimeout(() => {
        if (token === this.token) resolve();
      }, durationMs);
    });
  }
}
