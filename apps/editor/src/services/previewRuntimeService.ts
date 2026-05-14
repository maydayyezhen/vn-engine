import { VNRuntime, type RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";

/** 创建预览运行时。 */
export function createPreviewRuntime(project: VNProject): VNRuntime {
  return new VNRuntime(project);
}

/** 使用最新项目数据重新开始预览。 */
export function restartPreview(project: VNProject): { runtime: VNRuntime; snapshot: RuntimeSnapshot } {
  const runtime = createPreviewRuntime(project);
  const snapshot = runtime.start();
  return { runtime, snapshot };
}

/** 推进预览运行时。 */
export function nextPreview(runtime: VNRuntime): RuntimeSnapshot {
  return runtime.next();
}

/** 选择预览选项。 */
export function choosePreview(runtime: VNRuntime, optionId: string): RuntimeSnapshot {
  return runtime.choose(optionId);
}

/** 获取预览快照。 */
export function getPreviewSnapshot(runtime: VNRuntime): RuntimeSnapshot {
  return runtime.getSnapshot();
}
