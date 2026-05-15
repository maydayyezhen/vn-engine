# vn-engine

## 第18轮：Showcase 稳定性基线

当前新增了 Showcase Web 导出包自动验收脚本：

```bash
pnpm build
pnpm export:showcase-web
pnpm verify:showcase-export
```

`verify:showcase-export` 会临时启动本地静态服务器，检查 `dist/export/showcase-web-game/` 中的 `index.html`、`game/project.bundle.json`、`game/export-manifest.json`、构建后的 `assets/` 目录和 Showcase 依赖素材是否能以 HTTP 200 访问，并校验 manifest 中没有本地绝对路径或 `../` 逃逸路径。

当前功能基线见 `docs/current-feature-baseline.md`。本项目仍未进行 UI/UX 整体重构，也未接入 AI 素材生成 API、MiniMax、APIKey 管理或正式插件安全系统。

## 第十四轮返修：动作序列 MVP

当前第十四轮已收敛为动作序列 MVP。`ActionSequenceNode` 的主验收范围仅包含 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`。

`vn-core` 在遇到 `waitForCompletion=true` 的动作序列时会输出 `pendingActions` 并进入 `isWaitingForActionCompletion=true`，此时 `next()` 不会绕过等待；渲染器完成动作后由播放器调用 `VNRuntime.completeActionSequence()` 继续剧情。存档使用 `getSaveState()`，不会保存动作执行中间态，也不会在读档后重复播放旧动作。

`parallel` 和 `changeExpression` 仅保留旧 JSON 兼容：编辑器默认不再新增这些动作，`validateProject` 会阻止 nested parallel。当前仍不是复杂关键帧时间轴、曲线编辑器或节点图编辑器。

## 第十轮更新：Tauri 桌面工程读写

当前已接入 `apps/desktop` Tauri 桌面壳。桌面版加载同一个 `apps/editor` 界面，并提供新建工程、打开工程、保存工程、复制导入素材、导出完整 Web 游戏包等本地能力。

```bash
pnpm dev:desktop
pnpm build:desktop
```

Web 版 `pnpm dev:editor` 仍可独立运行；在 Web 模式下，桌面工程按钮会禁用并提示需要桌面版。本地工程只保存工程内相对路径，例如 `assets/background/classroom.png`。绝对路径、外部 URL 和 `../` 逃逸路径会被拒绝。

本项目是本地优先的视觉小说引擎与编辑器 monorepo，用于制作 Galgame/视觉小说。

当前已经打通结构化 JSON 工程、运行时解释器、编辑器内存态编辑、JSON 导入导出、素材库管理、PixiJS 播放器画面、浏览器端音频播放同步、播放器运行时 UI，以及 demo Web 游戏导出包。项目不包含后端，不包含数据库，不实现自定义脚本语言，也不实现节点图编辑器。

## 环境

- Node.js 24 已验证可用。
- 包管理器使用 pnpm workspace。

## 安装依赖

```bash
pnpm install
```

## 生成 demo 音频

```bash
pnpm generate:demo-audio
```

该命令会生成可复现的技术占位音频：

```text
apps/player/public/demo-assets/audio/bgm-demo.wav
apps/player/public/demo-assets/audio/sound-click.wav
apps/player/public/demo-assets/audio/voice-lincheng-001.wav
```

这些文件只用于验证 BGM、音效、语音的播放和停止链路，不使用网络下载素材，不涉及版权不明资源。项目 JSON 只保存 `/demo-assets/...` 路径元数据。

## 运行播放器 demo

```bash
pnpm dev:player
```

默认地址：

```text
http://localhost:5173/
```

播放器通过 `vn-core` 推进剧情，通过 `vn-renderer-pixi` 渲染 PixiJS 舞台，通过 `vn-audio` 根据运行时快照同步 BGM、音效和语音。运行时 UI 支持标题菜单、暂停菜单、存档读档、历史记录、设置、自动播放、快进已读和隐藏 UI。存档、设置和已读记录当前使用浏览器 `localStorage`，还不是 Tauri 本地工程文件。

## 运行编辑器

```bash
pnpm dev:editor
```

默认地址：

```text
http://localhost:5174/
```

编辑器支持节点编辑、素材库管理、角色表情映射、JSON 导入导出和文字化预览。编辑器预览不播放真实音频。

## 导出 demo Web 游戏包

```bash
pnpm build
pnpm export:demo-web
```

导出目录：

```text
dist/export/demo-web-game/
```

目录内包含 `index.html`、构建后的 `assets/`、`game/project.bundle.json`、`game/export-manifest.json` 和 `demo-assets/`。导出包需要通过静态服务器运行，不建议直接双击 `index.html`：

```bash
npx serve dist/export/demo-web-game
```

播放器启动时会优先加载 `/game/project.bundle.json`，加载失败时回退内置 demo，保证开发环境不白屏。

## 测试

```bash
pnpm test
```

当前测试覆盖：

- `vn-schema` 的脚本、跳转、素材、角色和表情引用校验。
- `vn-core` 的 start、next、choice、jump、条件分支、音频状态、两个 demo 结局和状态恢复。
- `vn-project` 的 JSON 序列化、反序列化、ProjectBundle 兼容和素材/角色数据保留。
- `vn-renderer-pixi` 的渲染资源解析逻辑。
- `vn-audio` 的音频资源解析和快照音频状态解析。
- `vn-ui-runtime` 的存档预览、存储、历史记录、设置容错和自动播放控制。
- `vn-export` 的导出素材引用收集、路径规范化和导出校验。

## 类型检查

```bash
pnpm typecheck
```

## 构建

```bash
pnpm build
```

## 架构边界

- `packages/vn-schema` 定义工程数据结构和基础校验。
- `packages/vn-core` 实现与 Vue、DOM、PixiJS、Tauri、Audio API 解耦的运行时解释器。
- `packages/vn-project` 提供项目序列化、反序列化和深拷贝纯逻辑。
- `packages/vn-renderer-pixi` 接收 `RuntimeSnapshot` 和 `VNProject`，负责 PixiJS 画面渲染。
- `packages/vn-audio` 接收 `RuntimeSnapshot` 和 `VNProject`，负责浏览器端音频同步。
- `packages/vn-ui-runtime` 提供存档、历史、设置和自动播放等运行时 UI 纯逻辑。
- `packages/vn-export` 提供 Web 导出校验、素材引用收集和导出清单生成。
- `apps/player` 使用 Vue 承载 PixiJS 舞台和音频控制，不使用 Element Plus。
- `apps/editor` 使用 Vue3、Vite、TypeScript、Element Plus 搭建编辑器。
- `apps/desktop` 仅预留未来 Tauri 桌面壳说明。

## 当前限制

- 不包含后端。
- 不包含数据库。
- 不接真实 Tauri 文件系统。
- 素材仍是路径元数据，不管理真实图片或音频二进制文件导入。
- 当前没有复杂音频淡入淡出。
- 当前没有复杂转场和演出时间轴。
- 当前没有 zip 导出。
- 不做节点图编辑器。
- 不实现自定义脚本语言。
## 第十一轮：编辑器工作流增强

当前编辑器支持多脚本管理、节点上移/下移、内部复制/剪切/粘贴、撤销/重做、节点搜索、类型筛选、校验结果定位和基础快捷键。工作流逻辑集中在 `apps/editor/src/services` 与 `apps/editor/src/stores`，Vue 组件只负责展示和触发操作。

常用快捷键：
- `Ctrl+S`：桌面模式保存工程，Web 模式导出项目 JSON。
- `Ctrl+Z`：撤销。
- `Ctrl+Y` 或 `Ctrl+Shift+Z`：重做。
- `Ctrl+C` / `Ctrl+X` / `Ctrl+V`：复制、剪切、粘贴当前节点。
- `Delete`：删除当前节点。
- `Ctrl+F`：聚焦节点搜索框。
## 第十二轮：演出系统与画面预览

当前结构化 JSON 支持基础演出参数：背景转场、角色入场/退场、角色位置、缩放、透明度、层级、水平翻转、基础 `CameraNode` 和对话文本表现字段。`vn-core` 只维护演出状态并输出到 `RuntimeSnapshot`，`vn-renderer-pixi` 根据快照执行基础画面表现，播放器和 Web 导出包都会保留这些字段。

编辑器预览区现在包含两种模式：
- 调试预览：显示快照、变量、音频和资源解析信息。
- 画面预览：复用 `PixiVNRenderer` 渲染当前内存项目，不播放真实音频。

## 第十三轮：剧情逻辑与变量系统增强

当前支持项目级变量定义、增强版 `SetVariableNode`、结构化 `ConditionExpression`、`LabelNode`、节点或标签跳转目标，以及运行时逻辑调试日志。编辑器新增变量管理、条件编辑、目标选择和预览日志显示；播放器调试面板也能显示最近变量、条件和跳转日志。
## 第十四轮：演出时间轴与动作序列

当前支持 `ActionSequenceNode`，可在一个节点中保存顺序动作和 `parallel` 并行动作组。动作类型包括 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`changeExpression`、`camera`、`playAudio`、`stopAudio`。`vn-core` 负责计算动作后的最终运行时状态并输出 `pendingActions`，`vn-renderer-pixi` 负责等待动作序列并通知完成，`apps/player` 收到完成回调后再推进剧情。当前仍不是复杂关键帧时间轴或曲线编辑器。
## 代码型动画模块 MVP

当前在第十四轮返修后新增了代码型动画模块 MVP：复杂可复用动画不再继续堆固定 `VNAction` 类型，而是由 `packages/vn-renderer-pixi` 中的 `AnimationModule` 代码模块实现。项目 JSON 只保存 `PlayAnimationNode.animationId`、`targets` 和 `params`，不保存动画代码、base64 或本地绝对路径。

`AnimationRegistry` 负责注册和查询动画模块。内置动画包括 `character.softEnter`、`character.nervousShake`、`character.breathe`、`camera.softZoom`、`camera.shakeLight`、`screen.flashWhite`、`screen.fadeToBlack` 和 `particle.snow`。编辑器根据动画模块的 `targetSlots` 和 `paramsSchema` 生成目标和参数表单；播放器把 `vn-core` 输出的一次性 pending animation 交给 `vn-renderer-pixi` 执行，完成后再由播放器调用运行时继续推进。

本能力不是复杂关键帧时间轴、不是节点图、不是正式插件市场，也没有接入 AI API。`animations/custom` 目录仅用于可信代码的开发者模式实验。

## Showcase Demo

第十五轮新增 `examples/showcase-game`：`《无人站的潮汐信》Showcase Demo`。它用于验证当前引擎在接近真实项目时的实际表现，覆盖背景、透明角色立绘、多表情、BGM、音效、语音占位、变量分支、Label 跳转、`PlayAnimationNode`、存档读档和 Web 导出包。

准备素材和浏览器访问副本：

```bash
pnpm prepare:showcase-assets
```

运行 Showcase：

```bash
pnpm dev:player:showcase
```

打开 `http://localhost:5173/?project=showcase`。编辑器顶部“项目操作”中也提供“加载 Showcase Demo”入口。

导出 Showcase Web 包：

```bash
pnpm build
pnpm export:showcase-web
```

导出目录为 `dist/export/showcase-web-game/`。当前仓库内置 Showcase 所需的真实/许可清楚素材：Potat0Master 背景、Xiael 透明角色部件组合、OpenGameArt BGM、Kenney 音效、Wikimedia Commons 物品图片；语音仍为本地技术占位。素材替换说明见 `examples/showcase-game/MANUAL_DOWNLOAD.md`，来源记录见 `examples/showcase-game/CREDITS.md`。

## PropLayer 物品系统

当前支持 `AssetItem type="prop"`、`ShowPropNode`、`HidePropNode`、运行时 `snapshot.props`、PixiJS `PropLayer`，并提供 `prop.revealCenter`、`prop.fadeOut`、`prop.floatOnce` 三个内置物品动画模块。物品作为独立画面对象参与 `PlayAnimationNode`，不会再临时塞进角色层或对话层。
