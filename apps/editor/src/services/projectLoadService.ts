import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../../examples/demo-game/scripts/start.vn.json";

/** 加载 demo 工程数据。 */
export function loadDemoProject(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}
