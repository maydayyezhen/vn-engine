# @vn-engine/vn-renderer-pixi

该包负责 PixiJS 渲染适配。它只接收 `RuntimeSnapshot` 和 `VNProject`，不直接解析原始剧本，不持有 `VNRuntime`，也不推进剧情。

当前能力：

- `PixiVNRenderer`：创建 PixiJS Application，挂载画布，按快照渲染舞台。
- `BackgroundLayer`：渲染背景图片，加载失败时显示占位背景。
- `CharacterLayer`：渲染左、中、右三个位置的角色，加载失败时显示占位角色卡片。
- `DialogueLayer`：渲染底部对话框、说话人和文本。
- `ChoiceLayer`：渲染可点击选项按钮，通过回调通知上层应用。
- `PixiAssetLoader`：按路径加载 PixiJS 纹理，并做简单缓存。
- `resolveRenderResources`：从 `RuntimeSnapshot` 和 `VNProject` 中解析背景、角色表情和音频调试资源。

当前不做：

- 真实音频播放。
- 复杂转场。
- 演出时间轴。
- 画面滤镜。
- 存档菜单。
- Vue、Element Plus 或 Tauri 依赖。
## 基础演出渲染

`vn-renderer-pixi` 支持背景 `none` / `fade` / `slideLeft` / `slideRight`，角色位置、自定义坐标、缩放、透明度、层级、水平翻转、基础入场和退场效果，以及基础镜头缩放、偏移和轻微震动。真实图片加载失败时仍使用占位图形渲染同样的演出参数。
