import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import projectJson from "../../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../../examples/demo-game/scripts/start.vn.json";
import showcaseProjectJson from "../../../../examples/showcase-game/project.vnproj.json";
import showcaseStartScriptJson from "../../../../examples/showcase-game/scripts/start.vn.json";

/** 深拷贝 JSON 数据，避免编辑器内存态修改污染静态导入对象。 */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 从 examples/demo-game 加载并组装完整 demo 工程数据。 */
export function loadDemoProject(): VNProject {
  const project = cloneJson(projectJson) as VNProject;
  const startScript = cloneJson(startScriptJson) as ScriptFile;

  return {
    ...project,
    scripts: [startScript]
  };
}

/** 从 examples/showcase-game 加载并组装完整 Showcase 工程数据。 */
export function loadShowcaseProject(): VNProject {
  const project = cloneJson(showcaseProjectJson) as VNProject;
  const startScript = cloneJson(showcaseStartScriptJson) as ScriptFile;

  return {
    ...project,
    scripts: [startScript]
  };
}
