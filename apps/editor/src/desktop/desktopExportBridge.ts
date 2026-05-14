import { collectProjectAssetRefs, createWebExportManifest, validateExportProject } from "@vn-engine/vn-export";
import { serializeProject } from "@vn-engine/vn-project";
import type { VNProject } from "@vn-engine/vn-schema";
import { isDesktopRuntime } from "./isDesktopRuntime";
import type { DesktopBridgeResult } from "./desktopProjectBridge";

/** 桌面端导出结果。 */
export interface DesktopWebExportResult {
  /** 导出目录绝对路径。 */
  export_dir: string;
  /** 已复制素材数量。 */
  copied_assets: number;
}

/** 动态获取 Tauri invoke。 */
async function getInvoke(): Promise<(<T>(command: string, args?: Record<string, unknown>) => Promise<T>) | undefined> {
  if (!isDesktopRuntime()) return undefined;
  const api = await import("@tauri-apps/api/core");
  return api.invoke;
}

/** 选择桌面 Web 游戏包导出目录。 */
export async function selectDesktopExportDirectory(): Promise<DesktopBridgeResult<string | null>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能选择导出目录。" };
  try {
    const path = await invoke<string | null>("select_export_directory");
    return { ok: true, data: path };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

/** 在桌面版中导出完整 Web 游戏包。 */
export async function exportDesktopWebGame(project: VNProject): Promise<DesktopBridgeResult<DesktopWebExportResult>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能导出完整 Web 游戏包。" };

  const validation = validateExportProject(project);
  if (!validation.valid) {
    return { ok: false, message: `导出校验失败：${validation.errors.join("；")}` };
  }

  const selected = await selectDesktopExportDirectory();
  if (!selected.ok) return { ok: false, message: selected.message };
  if (!selected.data) return { ok: false, message: "已取消选择导出目录。" };

  const assetRefs = collectProjectAssetRefs(project).map((asset) => ({
    source_path: asset.sourcePath,
    export_path: asset.exportPath
  }));

  try {
    const data = await invoke<DesktopWebExportResult>("export_web_game", {
      exportDir: selected.data,
      projectBundleJson: serializeProject(project),
      exportManifestJson: JSON.stringify(createWebExportManifest(project), null, 2),
      assetRefs
    });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}
