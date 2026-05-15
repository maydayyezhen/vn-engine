import type { AssetType } from "@vn-engine/vn-schema";
import { isDesktopRuntime } from "./isDesktopRuntime";
import type { DesktopBridgeResult } from "./desktopProjectBridge";

export interface DesktopImportedAsset {
  source_path: string;
  relative_path: string;
}

async function getInvoke(): Promise<(<T>(command: string, args?: Record<string, unknown>) => Promise<T>) | undefined> {
  if (!isDesktopRuntime()) return undefined;
  const api = await import("@tauri-apps/api/core");
  return api.invoke;
}

export async function importDesktopAssetFile(assetType: AssetType): Promise<DesktopBridgeResult<DesktopImportedAsset>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "当前运行环境不支持导入资源文件" };
  try {
    const data = await invoke<DesktopImportedAsset>("import_asset_file", { assetType });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

export async function selectDesktopAssetPath(assetType: AssetType): Promise<DesktopBridgeResult<string | null>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "当前运行环境不支持选择资源文件" };
  try {
    const data = await invoke<string | null>("select_asset_file", { assetType });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

export async function copyDesktopAssetFile(
  sourcePath: string,
  assetType: AssetType
): Promise<DesktopBridgeResult<DesktopImportedAsset>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "当前运行环境不支持复制资源文件" };
  try {
    const data = await invoke<DesktopImportedAsset>("copy_asset_to_project", { sourcePath, assetType });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

export async function revealDesktopAsset(relativePath: string): Promise<DesktopBridgeResult<void>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "当前运行环境不支持定位资源文件" };
  try {
    await invoke<void>("reveal_asset_in_folder", { relativePath });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}