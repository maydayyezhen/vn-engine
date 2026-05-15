import type { RuntimeActionEffect } from "@vn-engine/vn-core";
import { buildActionTimeline } from "./actionTimeline";

/** 轻量动作播放协调器，只负责等待动作序列时长并通知完成。 */
export class ActionPlayer {
  /** 当前播放令牌，用于让旧动作序列失效。 */
  private token = 0;
  /** 当前等待计时器。 */
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** 当前等待 promise 的释放函数，stop/destroy 时用于避免悬挂。 */
  private resolveCurrentWait: (() => void) | null = null;

  /** 播放动作序列；视觉变化由各渲染层根据快照负责，本类只协调顺序/并行等待。 */
  async play(actions: RuntimeActionEffect[]): Promise<void> {
    this.stop();
    const token = this.token;
    for (const step of buildActionTimeline(actions)) {
      if (token !== this.token) return;
      await this.wait(step.durationMs, token);
    }
  }

  /** 停止当前动作序列，并释放仍在等待的 promise。 */
  stop(): void {
    this.token += 1;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.resolveCurrentWait?.();
    this.resolveCurrentWait = null;
  }

  /** 销毁播放器。 */
  destroy(): void {
    this.stop();
  }

  /** 等待指定毫秒数。 */
  private wait(durationMs: number, token: number): Promise<void> {
    if (durationMs <= 0) return Promise.resolve();
    return new Promise((resolve) => {
      this.resolveCurrentWait = resolve;
      this.timer = setTimeout(() => {
        this.resolveCurrentWait = null;
        this.timer = null;
        if (token === this.token) resolve();
      }, durationMs);
    });
  }
}
