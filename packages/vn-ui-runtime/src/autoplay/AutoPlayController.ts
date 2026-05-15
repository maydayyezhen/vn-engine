import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** 自动播放控制器配置。 */
export interface AutoPlayControllerOptions {
  /** 自动播放间隔毫秒数。 */
  delayMs: number;
  /** 触发下一步的回调。 */
  onNext: () => void;
}

/** 不依赖 Vue 的自动播放控制器。 */
export class AutoPlayController {
  /** 自动播放间隔毫秒数。 */
  private delayMs: number;
  /** 下一步回调。 */
  private readonly onNext: () => void;
  /** 当前是否启用。 */
  private enabled = false;
  /** 当前计时器。 */
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** 创建自动播放控制器。 */
  constructor(options: AutoPlayControllerOptions) {
    this.delayMs = options.delayMs;
    this.onNext = options.onNext;
  }

  /** 开启自动播放并尝试安排下一次推进。 */
  start(snapshot: RuntimeSnapshot): void {
    this.enabled = true;
    this.schedule(snapshot);
  }

  /** 关闭自动播放。 */
  stop(): void {
    this.enabled = false;
    this.clearTimer();
  }

  /** 更新自动播放间隔。 */
  setDelay(delayMs: number): void {
    this.delayMs = Math.max(300, delayMs);
  }

  /** 根据当前快照安排下一次推进；选项和结束状态会自动暂停。 */
  schedule(snapshot: RuntimeSnapshot): void {
    this.clearTimer();
    if (!this.enabled) return;
    if (snapshot.type === "choices" || snapshot.isEnded) {
      this.stop();
      return;
    }
    if (snapshot.isWaitingForActionCompletion) return;
    this.timer = setTimeout(() => {
      this.onNext();
    }, this.delayMs);
  }

  /** 当前是否启用自动播放。 */
  isEnabled(): boolean {
    return this.enabled;
  }

  /** 销毁控制器。 */
  destroy(): void {
    this.stop();
  }

  /** 清理计时器。 */
  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }
}
