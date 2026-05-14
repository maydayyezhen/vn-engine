/** 判断当前页面是否运行在 Tauri 桌面环境中。 */
export function isDesktopRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
