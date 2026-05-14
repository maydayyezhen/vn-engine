import type { AssetType } from "@vn-engine/vn-schema";
import { isDesktopRuntime } from "./isDesktopRuntime";
import type { DesktopBridgeResult } from "./desktopProjectBridge";

/** 桌面端素材导入结果。 */
export interface DesktopImportedAsset {
  /** 原始文件绝对路径，仅用于本次操作回显。 */
  source_path: string;
  /** 复制到工程 assets 后的相对路径。 */
  relative_path: string;
}

/** 动态获取 Tauri invoke。 */
async function getInvoke(): Promise<(<T>(command: string, args?: Record<string, unknown>) => Promise<T>) | undefined> {
  if (!isDesktopRuntime()) return undefined;
  const api = await import("@tauri-apps/api/core");
  return api.invoke;
}

/** 在桌面版中选择并导入素材到当前工程。 */
export async function importDesktopAssetFile(assetType: AssetType): Promise<DesktopBridgeResult<DesktopImportedAsset>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能复制本地素材文件。" };
  try {
    const data = await invoke<DesktopImportedAsset>("import_asset_file", { assetType });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

/** 在桌面文件管理器中定位工程内素材。 */
export async function revealDesktopAsset(relativePath: string): Promise<DesktopBridgeResult<void>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能定位素材文件。" };
  try {
    await invoke<void>("reveal_asset_in_folder", { relativePath });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}
