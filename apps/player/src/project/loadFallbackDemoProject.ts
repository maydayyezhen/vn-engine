import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../../examples/demo-game/scripts/start.vn.json";

/** 加载播放器内置 demo 项目。 */
export function loadFallbackDemoProject(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}
