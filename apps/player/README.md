# apps/player

最小 Web 播放器。当前使用 Vue3 + Vite + TypeScript 承载 PixiJS 舞台，通过 `@vn-engine/vn-core` 驱动剧情，通过 `@vn-engine/vn-renderer-pixi` 渲染画面，通过 `@vn-engine/vn-audio` 同步音频播放。

当前能力：

- 加载 `examples/demo-game` 示例工程。
- 使用 `VNRuntime` 处理自动节点、对话、选项、跳转和结局。
- 使用 `PixiVNRenderer` 渲染背景层、角色层、对话层和选项层。
- 图片路径加载失败时自动显示占位背景和占位角色卡片。
- 根据 `RuntimeSnapshot.audio` 同步 BGM、音效和语音。
- 音频加载或播放失败时显示错误提示，剧情继续推进。
- 支持主音量滑块和静音开关。
- 选项点击由 PixiJS 选项层回调到 Vue，再调用 `VNRuntime.choose(optionId)`。
- “下一步”和“重新开始”由 Vue 控制，继续复用 `VNRuntime`。
- 右侧调试面板显示当前脚本、节点、变量、背景、角色、音频状态、解析资源和错误。

Demo 素材：

- 音频文件由 `pnpm generate:demo-audio` 生成到 `apps/player/public/demo-assets/audio/`。
- 项目 JSON 只保存 `/demo-assets/...` 路径元数据。
- 当前不从网络下载任何不明来源素材。

限制：

- 不使用 Element Plus。
- 不做复杂音频淡入淡出。
- 不做复杂转场和演出时间轴。
- 不做自动播放、快进、历史记录或存档菜单。
- 不解释 `StoryNode`；剧情推进仍由 `vn-core` 完成。
