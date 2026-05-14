/** PixiJS 渲染器占位对象。 */
export interface PixiRendererPlaceholder {
  /** 占位渲染器名称。 */
  name: string;
  /** 当前是否只是占位实现。 */
  placeholder: true;
}

/** 创建第一阶段 PixiJS 渲染器占位对象。 */
export function createPixiRendererPlaceholder(): PixiRendererPlaceholder {
  return {
    name: "vn-renderer-pixi-placeholder",
    placeholder: true
  };
}
