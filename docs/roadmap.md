# 路线图

## 第十四轮返修状态：动作序列 MVP 已收敛

状态：已完成返修。

- `ActionSequenceNode` 当前作为 MVP 使用，主验收动作类型为 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`。
- `vn-core` 新增 `completeActionSequence()`，动作等待期间 `next()` 不会推进，避免点击、自动播放或快进绕过演出。
- 存档通过 `getSaveState()` 保存稳定状态，不保存 `pendingActions` 或动作执行中间态。
- `vn-renderer-pixi` 对同一动作序列做播放 key 去重，避免重复 render 反复触发完成回调。
- `parallel` 与 `changeExpression` 仅保留旧 JSON 兼容；编辑器默认不再新增，nested parallel 会被校验拦截。
- 当前不是复杂关键帧时间轴、曲线编辑器或节点图编辑器。

## 第9阶段补充：Tauri 本地工程读写

状态：已完成基础闭环。

- `apps/desktop` 已初始化为 Tauri 桌面壳。
- 桌面端可新建、打开、保存本地视觉小说工程。
- 本地工程采用 `project.vnproj.json`、`scripts/` 和 `assets/` 目录结构。
- 桌面端可导入素材文件，复制到工程 `assets` 子目录，并返回工程内相对路径。
- 桌面端可导出完整 Web 游戏包。
- Web 编辑器继续可独立运行，桌面能力按钮在 Web 模式下禁用。

## 第 1 阶段：schema + core + demo-player

状态：已完成。

- 定义 `VNProject`、素材、角色、脚本和 `StoryNode` 联合类型。
- 实现 `validateProject` 基础校验。
- 实现 `VNRuntime` 的 start、next、choose、jump、getState、loadState。
- 打通 `examples/demo-game` 到 `apps/player` 的最小播放流程。

## 第 2 阶段：编辑器基础编辑能力

状态：已完成。

- 实现节点基础表单编辑。
- 实现内存态节点新增、删除、复制和修改。
- 增加工程校验结果展示。
- 增加基于 `vn-core` 的编辑器底部预览。

## 第 3 阶段：项目 JSON 导入导出

状态：已完成。

- `packages/vn-project` 提供 `ProjectBundle`、序列化、反序列化和深拷贝。
- 编辑器支持导出当前项目 JSON。
- 编辑器支持导入 `ProjectBundle` 或裸 `VNProject` JSON。
- 支持重置 demo 和 dirty 状态展示。

## 第 4 阶段：素材库与资源引用闭环

状态：已完成。

- `vn-schema` 增强素材、角色和表情结构。
- `validateProject` 校验背景、角色、表情、音频素材引用。
- 编辑器支持素材元数据新增、编辑、删除。
- 编辑器支持角色和角色表情映射新增、编辑、删除。
- 节点属性面板通过资源下拉框引用背景、角色、表情和音频。

## 第 5 阶段：PixiJS 基础渲染层

状态：已完成。

- `vn-renderer-pixi` 正式接入 PixiJS。
- 播放器通过 `PixiVNRenderer` 渲染背景层、角色层、对话层和选项层。
- 图片加载失败时回退占位图形。
- 播放器仍由 `vn-core` 推进剧情。

## 第 6 阶段：浏览器端音频播放闭环

状态：已完成。

- `vn-audio` 基于 `HTMLAudioElement` 同步 BGM、音效和语音。
- `vn-core` 只维护音频状态，不直接播放音频。
- `apps/player` 根据运行时快照同步音频，并提供主音量和静音控制。
- demo 音频通过 `scripts/generate-demo-audio.mjs` 可复现生成。

## 第 7 阶段：播放器运行时 UI 闭环

状态：已完成。

- `vn-ui-runtime` 提供存档、历史、设置和自动播放纯逻辑。
- `apps/player` 支持标题菜单、暂停菜单、存档读档、删除存档、历史记录、设置、自动播放、快进已读和隐藏 UI。
- 存档、设置和已读记录当前使用浏览器 `localStorage`。
- 读档后继续通过 `vn-core` 恢复状态，通过 `vn-audio` 同步音频。

## 第 8 阶段：Web 游戏导出包闭环

状态：已完成。

- 新增 `packages/vn-export`，支持导出素材引用收集、路径规范化、导出校验和 Web 导出清单。
- `apps/player` 启动时优先加载 `/game/project.bundle.json`，失败时回退内置 demo。
- `apps/editor` 增加 Web 导出校验视图，可导出当前 ProjectBundle JSON。
- `scripts/export-demo-web-game.mjs` 可生成 `dist/export/demo-web-game/` 静态 Web 游戏目录。
- 当前不生成 zip，不复制任意本地素材，完整目录选择和素材复制留到 Tauri 阶段。

## 第 9 阶段：Tauri 本地工程读写

状态：未开始。

接入桌面壳能力，支持打开本地项目文件夹、读写工程文件、导入素材和调用系统文件选择器。

## 第 10 阶段：正式存档系统和 Web 游戏发布增强

状态：未开始。

增强多项目存档兼容、导出包版本校验、zip 打包和发布配置。

## 第 11 阶段：演出时间轴、转场、语音增强

状态：未开始。

增强演出能力，包括转场、时间轴、语音等待、文本演出和更细的音频控制。

## 第 12 阶段：可选脚本文法和 vn-compiler

状态：未开始。

如果结构化 JSON 无法满足创作效率，再在 `vn-compiler` 中设计类 Ren'Py 的脚本文法并转换为 `StoryNode`。
## 第十一轮状态：编辑器工作流增强已完成

本轮补齐长期创作需要的基础编辑效率能力：多脚本管理、入口脚本设置、节点上移/下移、内部复制/剪切/粘贴、撤销/重做、节点搜索、节点类型筛选、校验错误定位和基础快捷键。仍不引入节点图编辑器、自定义脚本语言、复杂演出时间轴或 AI 素材生成。
## 第十二轮状态：演出系统与画面预览已完成

本轮完成基础演出闭环：背景转场、角色入场/退场、角色位置/缩放/透明度/层级/翻转、基础 `CameraNode`、对话表现字段、播放器 Pixi 渲染适配，以及编辑器调试预览/画面预览切换。仍不包含节点图、复杂时间轴、关键帧系统、AI 素材生成或整体 UI/UX 重构。

## 第十三轮状态：剧情逻辑与变量系统增强已完成

本轮补强长篇剧情逻辑基础：项目级变量定义、`set/add/subtract` 变量赋值、结构化 `ConditionExpression`、`LabelNode`、节点或标签目标、运行时变量/条件/跳转日志，以及编辑器变量管理、条件编辑、目标选择和逻辑调试显示。仍不包含自定义脚本语言、节点图、复杂时间轴或 AI 素材生成。
## 第十四轮状态：演出时间轴与动作序列已完成

当前已经补齐最小动作序列闭环：`ActionSequenceNode` 支持顺序动作和 `parallel` 并行动作组，动作覆盖等待、背景、角色显示/隐藏/移动/表情切换、镜头、音频播放和停止。编辑器提供基础动作列表编辑器，播放器通过 Pixi 渲染器动作完成回调继续推进剧情。仍不包含节点图、关键帧曲线编辑器、复杂专业时间轴或 AI 素材生成。
## 第十四轮返修后续：代码型动画模块 MVP

当前新增 `AnimationModule + AnimationRegistry + PlayAnimationNode` 链路。可复用动画以 TypeScript 模块存在于 `vn-renderer-pixi`，项目 JSON 只引用 `animationId`、`targets` 和 `params`。编辑器根据动画元数据生成表单，播放器通过渲染器执行动画并在完成后由 `vn-core` 继续推进。

已包含内置动画：角色柔和入场、角色轻抖、角色呼吸、镜头推进、镜头轻震、白色闪屏、淡出至黑、雪花粒子。当前仍不是关键帧时间轴、节点图、正式插件市场，也没有接入 AI API。
