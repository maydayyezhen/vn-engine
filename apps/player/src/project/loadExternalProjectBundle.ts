import { deserializeProject } from "@vn-engine/vn-project";
import type { VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";

/** 外部项目加载成功结果。 */
export interface ExternalProjectLoadSuccess {
  /** 是否加载成功。 */
  ok: true;
  /** 解析后的项目。 */
  project: VNProject;
}

/** 外部项目加载失败结果。 */
export interface ExternalProjectLoadFailure {
  /** 是否加载成功。 */
  ok: false;
  /** 失败原因。 */
  message: string;
}

/** 外部项目加载结果。 */
export type ExternalProjectLoadResult = ExternalProjectLoadSuccess | ExternalProjectLoadFailure;

/** 可以注入测试的 fetch 函数类型。 */
export type ProjectBundleFetcher = (url: string) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

/** 从外部 ProjectBundle URL 加载项目。 */
export async function loadExternalProjectBundle(fetcher: ProjectBundleFetcher, url = "/game/project.bundle.json"): Promise<ExternalProjectLoadResult> {
  try {
    const response = await fetcher(url);
    if (!response.ok) {
      return { ok: false, message: `外部项目包请求失败：HTTP ${response.status}` };
    }
    const project = deserializeProject(await response.text());
    const validation = validateProject(project);
    if (!validation.valid) {
      return { ok: false, message: `外部项目校验失败：${validation.errors.map((issue) => issue.message).join("; ")}` };
    }
    return { ok: true, project };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "外部项目加载失败。" };
  }
}
