import { VNRuntime } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { loadFallbackDemoProject } from "../project/loadFallbackDemoProject";

/** 创建内置 demo 工程数据。 */
export function createDemoProject(): VNProject {
  return loadFallbackDemoProject();
}

/** 创建并启动 demo 运行时。 */
export function createDemoRuntime(): VNRuntime {
  const runtime = new VNRuntime(createDemoProject());
  runtime.start();
  return runtime;
}
