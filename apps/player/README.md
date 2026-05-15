# apps/player

## 动作序列 MVP 播放规则

播放器当前按动作序列 MVP 工作：遇到 `snapshot.isWaitingForActionCompletion=true` 时禁用普通推进，等待 `PixiVNRenderer` 的完成回调，然后调用 `VNRuntime.completeActionSequence()`。自动播放和快进已读也不会绕过这个等待状态。

存档使用 `VNRuntime.getSaveState()`，只保存动作完成后的稳定画面状态，不保存 `pendingActions` 或执行中间态。当前主验收动作是 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`；复杂 parallel、changeExpression 独立动作和关键帧时间轴暂缓。

## Action Sequence Playback

第十四轮播放器支持 `ActionSequenceNode`。播放器继续由 `vn-core` 推进剧情；
当快照包含 `pendingActions` 且标记 `isWaitingForActionCompletion` 时，播放器禁用下一步，
把动作交给 `vn-renderer-pixi` 播放，并在渲染器发出完成回调后再调用 `VNRuntime.next()`。

动作序列中的音频动作仍通过 `RuntimeSnapshot.audio` 交给 `vn-audio` 同步。存档读档恢复的是
动作执行后的静态背景、角色、镜头和音频状态，不保存动画播放到一半的帧状态。

最小 Web 播放器。当前使用 Vue3 + Vite + TypeScript 承载 PixiJS 舞台，通过 `@vn-engine/vn-core` 驱动剧情，通过 `@vn-engine/vn-renderer-pixi` 渲染画面，通过 `@vn-engine/vn-audio` 同步音频播放。

当前能力：

- 优先加载 `/game/project.bundle.json` 外部项目包；失败时回退 `examples/demo-game` 示例工程。
- 使用 `VNRuntime` 处理自动节点、对话、选项、跳转和结局。
- 使用 `PixiVNRenderer` 渲染背景层、角色层、对话层和选项层。
- 图片路径加载失败时自动显示占位背景和占位角色卡片。
- 根据 `RuntimeSnapshot.audio` 同步 BGM、音效和语音。
- 音频加载或播放失败时显示错误提示，剧情继续推进。
- 支持主音量滑块和静音开关。
- 支持标题菜单和暂停菜单。
- 支持存档、读档和删除存档，当前写入浏览器 `localStorage`。
- 支持历史记录查看和清空，当前为本次游玩会话历史。
- 支持设置面板，主音量、通道音量、静音、自动播放、快进已读和文本速度会保存到 `localStorage`。
- 支持自动播放，遇到选项或剧情结束会暂停。
- 支持快进已读的最小实现，已读节点集合保存到 `localStorage`。
- 支持隐藏和恢复运行时 UI。
- 选项点击由 PixiJS 选项层回调到 Vue，再调用 `VNRuntime.choose(optionId)`。
- “下一步”和“重新开始”由 Vue 控制，继续复用 `VNRuntime`。
- 右侧调试面板显示当前脚本、节点、变量、背景、角色、音频状态、解析资源和错误。
- 导出的 Web 游戏包可以直接复用当前播放器能力，包括画面、音频、存档、读档和设置。

Demo 素材：

- 音频文件由 `pnpm generate:demo-audio` 生成到 `apps/player/public/demo-assets/audio/`。
- 项目 JSON 只保存 `/demo-assets/...` 路径元数据。
- 当前不从网络下载任何不明来源素材。

外部项目加载：

- 静态 Web 游戏包应在根目录提供 `game/project.bundle.json`。
- 该文件必须是 `ProjectBundle` 或兼容的项目 JSON。
- 加载后会通过 `vn-schema` 校验；失败时回退内置 demo 并在调试面板显示原因。
- 存档和设置 key 按项目 id 隔离，避免不同项目互相污染。

限制：

- 不使用 Element Plus。
- 不做复杂音频淡入淡出。
- 不做复杂转场和演出时间轴。
- 不接 Tauri 本地文件系统。
- 不生成 zip 包。
- 不解释 `StoryNode`；剧情推进仍由 `vn-core` 完成。
## 演出播放

播放器继续由 `vn-core` 推进剧情，并把 `RuntimeSnapshot` 交给 `vn-renderer-pixi`。当前支持基础背景转场、角色入场/退场、角色位置/缩放/透明度/层级/翻转和基础镜头效果。还没有复杂时间轴、关键帧系统或正式转场编辑器。

## 剧情逻辑播放

播放器继续只调用 `vn-core` 推进剧情。变量初始化、变量赋值、结构化条件、标签跳转和跳转日志都由核心运行时处理；播放器调试面板显示 `RuntimeSnapshot.variables` 和最近 `debugLog`，不在播放器中重复解释剧情节点。
