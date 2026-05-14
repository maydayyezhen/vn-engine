import type { RuntimeSnapshot } from "@vn-engine/vn-core";

/** PixiJS 舞台占位类，后续只接收运行时快照进行渲染。 */
export class PixiStage {
  /** 最近一次收到的运行时快照。 */
  private latestSnapshot: RuntimeSnapshot | null = null;

  /** 更新舞台快照。 */
  update(snapshot: RuntimeSnapshot): void {
    this.latestSnapshot = snapshot;
  }

  /** 获取最近一次舞台快照。 */
  getLatestSnapshot(): RuntimeSnapshot | null {
    return this.latestSnapshot;
  }
}
