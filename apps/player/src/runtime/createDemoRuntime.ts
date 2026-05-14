import { VNRuntime } from "@vn-engine/vn-core";
import type { VNProject, ScriptFile } from "@vn-engine/vn-schema";
import projectJson from "../../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../../examples/demo-game/scripts/start.vn.json";

/** 创建内置 demo 工程数据。 */
export function createDemoProject(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}

/** 创建并启动 demo 运行时。 */
export function createDemoRuntime(): VNRuntime {
  const runtime = new VNRuntime(createDemoProject());
  runtime.start();
  return runtime;
}
