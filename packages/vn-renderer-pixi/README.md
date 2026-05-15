# @vn-engine/vn-renderer-pixi

## 动作序列 MVP 返修说明

`PixiVNRenderer` 当前只负责播放 `RuntimeSnapshot.pendingActions`，并通过 `onActionSequenceComplete` 通知上层。它不会持有 `VNRuntime`，也不会直接调用 `next()` 或 `choose()`。

渲染器会用 `scriptId/currentNodeId/pendingActions` 生成动作序列 key；同一个 key 重复 render 不会重新启动动作，也不会重复触发完成回调。新的动作序列到来时会停止旧的 `ActionPlayer`。`ActionPlayer.stop()` 和 `destroy()` 会释放等待中的 promise，避免悬挂。

当前主验收范围是顺序 MVP 动作：`wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`。`parallel` 仅保留兼容，不代表已经完成复杂关键帧时间轴。

## Action Sequence Rendering

第十四轮新增动作序列播放支撑。`PixiVNRenderer` 会读取
`RuntimeSnapshot.pendingActions`，交给 `ActionPlayer` 按顺序或 `parallel` 分组播放。
渲染器只负责播放和在完成后触发 `onActionSequenceComplete` 回调，不直接调用
`VNRuntime.next()`，剧情推进仍由播放器协调。

当前动作序列复用已有背景层、角色层和镜头逻辑，支持 `wait`、背景切换、角色显示、
隐藏、移动、表情切换、镜头动作，以及音频动作的状态联动。音频播放仍由
`vn-audio` 根据运行时快照同步，Pixi 渲染层不直接播放音频。

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
## 代码型动画模块

渲染包现在提供 `AnimationModule`、`AnimationRegistry` 和内置动画集合。动画模块是受控的 TypeScript 代码文件，声明 `id`、`name`、`category`、`targetSlots`、`paramsSchema` 和 `play(ctx, payload)`。`vn-core` 不执行动画，只在 `PlayAnimationNode` 上输出一次性 pending animation；`PixiVNRenderer` 根据 `animationId` 查找模块并执行。

内置动画包括 `character.softEnter`、`character.nervousShake`、`character.breathe`、`camera.softZoom`、`camera.shakeLight`、`screen.flashWhite`、`screen.fadeToBlack` 和 `particle.snow`。

`animations/custom` 是实验性开发者模式目录，只适合可信代码。当前没有插件沙箱、签名系统或 AI API 接入。
