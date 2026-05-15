import type { VNProject } from "@vn-engine/vn-schema";
import { loadExternalProjectBundle, type ProjectBundleFetcher } from "./loadExternalProjectBundle";
import { loadFallbackDemoProject, loadFallbackShowcaseProject } from "./loadFallbackDemoProject";

/** 播放器项目来源。 */
export type PlayerProjectSource = "external" | "demo";

/** 播放器内置项目选择。 */
export type BuiltinPlayerProject = "demo" | "showcase";

/** 播放器项目加载结果。 */
export interface PlayerProjectLoadResult {
  /** 当前实际使用的项目。 */
  project: VNProject;
  /** 项目来源。 */
  source: PlayerProjectSource;
  /** 外部项目加载失败时的错误信息。 */
  message?: string;
}

/** 加载播放器项目，优先外部 ProjectBundle，失败时回退 demo。 */
/** 从 URL 参数读取内置项目选择。 */
function getBuiltinProjectFromUrl(): BuiltinPlayerProject {
  if (typeof window === "undefined") return "demo";
  const project = new URLSearchParams(window.location.search).get("project");
  return project === "showcase" ? "showcase" : "demo";
}

/** 加载内置项目。 */
function loadBuiltinProject(project: BuiltinPlayerProject): VNProject {
  return project === "showcase" ? loadFallbackShowcaseProject() : loadFallbackDemoProject();
}

export async function loadPlayerProject(fetcher: ProjectBundleFetcher = fetch, builtinProject = getBuiltinProjectFromUrl()): Promise<PlayerProjectLoadResult> {
  const external = await loadExternalProjectBundle(fetcher);
  if (external.ok) {
    return { project: external.project, source: "external" };
  }
  return {
    project: loadBuiltinProject(builtinProject),
    source: "demo",
    message: external.message
  };
}
