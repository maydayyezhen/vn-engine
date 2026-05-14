# @vn-engine/vn-renderer-pixi

该包未来负责 PixiJS 渲染适配。它只接收 `RuntimeSnapshot`，不直接解析原始剧本。

未来职责包括：

- 背景层
- 角色立绘层
- 特效层
- 转场动画
- 画面滤镜

第一阶段只提供占位导出，不实现复杂渲染，也不引入 Element Plus。
