import type { VNProject } from "@vn-engine/vn-schema";
import { loadExternalProjectBundle, type ProjectBundleFetcher } from "./loadExternalProjectBundle";
import { loadFallbackDemoProject } from "./loadFallbackDemoProject";

/** 播放器项目来源。 */
export type PlayerProjectSource = "external" | "demo";

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
export async function loadPlayerProject(fetcher: ProjectBundleFetcher = fetch): Promise<PlayerProjectLoadResult> {
  const external = await loadExternalProjectBundle(fetcher);
  if (external.ok) {
    return { project: external.project, source: "external" };
  }
  return {
    project: loadFallbackDemoProject(),
    source: "demo",
    message: external.message
  };
}
