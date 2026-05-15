import { Assets, Texture } from "pixi.js";

/** PixiJS 纹理加载器，负责按路径加载并缓存纹理。 */
export class PixiAssetLoader {
  /** 已成功加载的纹理缓存。 */
  private readonly cache = new Map<string, Texture>();

  /** 按路径加载纹理，失败时返回 null，避免页面崩溃。 */
  async loadTexture(path: string | undefined): Promise<Texture | null> {
    if (!path) return null;
    const cached = this.cache.get(path);
    if (cached) return cached;

    try {
      const texture = await Assets.load<Texture>(path);
      this.cache.set(path, texture);
      return texture;
    } catch {
      return null;
    }
  }

  /** 清理纹理缓存引用。 */
  clear(): void {
    this.cache.clear();
  }
}
