# apps/player

最小 Web 播放器。当前使用 Vue3 + Vite + TypeScript 承载 PixiJS 舞台，通过 `@vn-engine/vn-core` 驱动剧情，通过 `@vn-engine/vn-renderer-pixi` 渲染画面。

当前能力：

- 加载 `examples/demo-game` 示例工程。
- 使用 `VNRuntime` 处理自动节点、对话、选项、跳转和结局。
- 使用 `PixiVNRenderer` 渲染背景层、角色层、对话层和选项层。
- 图片路径加载失败时自动显示占位背景和占位角色卡片。
- 选项点击由 PixiJS 选项层回调到 Vue，再调用 `VNRuntime.choose(optionId)`。
- “下一步”和“重新开始”由 Vue 控制，继续复用 `VNRuntime`。
- 右侧调试面板显示当前脚本、节点、变量、背景、角色和音频状态。

限制：

- 不使用 Element Plus。
- 不做真实音频播放。
- 不做复杂转场和演出时间轴。
- 不做自动播放、快进、历史记录或存档菜单。
- 不解释 `StoryNode`；剧情推进仍由 `vn-core` 完成。
