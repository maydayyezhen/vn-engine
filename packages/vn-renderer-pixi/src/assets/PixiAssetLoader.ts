import { Assets, Texture } from "pixi.js";

/** PixiJS 纹理加载器，负责按路径加载并缓存纹理。 */
export class PixiAssetLoader {
  /** 已成功加载的纹理缓存。 */
  private readonly cache = new Map<string, Texture>();
  /** 已确认加载失败的路径，避免缺失占位素材反复阻塞渲染。 */
  private readonly failedPaths = new Set<string>();
  /** 单个纹理加载最长等待时间，超时后使用占位图形。 */
  private readonly timeoutMs = 500;

  /** 按路径加载纹理，失败时返回 null，避免页面崩溃。 */
  async loadTexture(path: string | undefined): Promise<Texture | null> {
    if (!path) return null;
    if (this.failedPaths.has(path)) return null;
    const cached = this.cache.get(path);
    if (cached) return cached;

    try {
      const texture = await this.loadWithTimeout(path);
      this.cache.set(path, texture);
      return texture;
    } catch {
      this.failedPaths.add(path);
      return null;
    }
  }

  /** 带超时的纹理加载，避免缺失素材让首屏一直等待。 */
  private loadWithTimeout(path: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`纹理加载超时：${path}`)), this.timeoutMs);
      void Assets.load<Texture>(path)
        .then((texture) => {
          clearTimeout(timer);
          resolve(texture);
        })
        .catch((error: unknown) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  /** 清理纹理缓存引用。 */
  clear(): void {
    this.cache.clear();
    this.failedPaths.clear();
  }
}
