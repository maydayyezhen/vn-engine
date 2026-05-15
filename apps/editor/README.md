# apps/editor

## 工作台式 UI

第19轮将编辑器整理为专业 VN 创作工具工作台。当前主界面包含：

- 顶部菜单栏和工具栏：项目、编辑、视图、预览、构建、导出、帮助，以及新建、打开、保存、撤销、重做、查找、预览、构建等入口。
- 左侧资源管理器：按脚本、角色、背景、音频、语音、物品、变量和动画分类浏览项目内容，并提供资源缩略图/元信息预览。
- 中央主工作区：上方是大尺寸 16:9 场景预览，下方是脚本指令表、素材库、角色库、变量库、动画模块和导出检查等工作区。
- 右侧检查器：显示当前节点、资源、角色、变量、动画或校验问题的属性与事件信息。
- 底部状态栏：显示项目、脚本、节点、dirty 状态、校验数量、Web/桌面模式和预览缩放。

本轮只重构编辑器信息架构和入口组织，底层编辑 service、runtime 预览、桌面 bridge、导入导出和 Web 导出语义保持不变。

## 动作序列 MVP 编辑范围

编辑器当前只默认新增动作序列 MVP 类型：`wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`。动作卡片会显示简短摘要，资源选择显示名称和 id。

`parallel` 与 `changeExpression` 只用于旧项目兼容，不再作为默认新增入口；nested parallel 会由校验提示。当前仍不是复杂关键帧时间轴、曲线编辑器或节点图编辑器。

## Action Sequence Editing

第十四轮新增 `ActionSequenceNode` 最小编辑闭环。节点工具栏可以新增动作序列节点，
属性面板可以编辑动作序列名称、是否等待完成、是否自动继续，并维护顺序动作和
`parallel` 子动作。

动作编辑器支持新增、复制、删除、上移、下移动作，并按动作类型编辑资源、角色、
位置、镜头、音频和时长等字段。调试预览会显示 `pendingActions`，画面预览继续复用
`vn-renderer-pixi`，不播放真实音频。

## 桌面模式

当编辑器运行在 Tauri 中时，顶部工具栏会显示“桌面模式”，并启用新建工程、打开工程、保存工程、导入本地素材、导出完整 Web 游戏包等能力。Web 模式下这些按钮禁用，仍保留 JSON 导入导出和素材元数据手动编辑能力。

桌面素材导入会把用户选择的文件复制到当前工程 `assets` 子目录，并把工程内相对路径登记到素材库，不会把本地绝对路径写入项目 JSON。

最小可用编辑器。当前使用 Vue3 + Vite + TypeScript + Element Plus 展示并编辑 demo-game 的项目树、节点列表、节点属性、素材库、角色库、校验结果、运行预览和 Web 导出检查。

当前能力：

- 内存态编辑结构化 JSON 剧本。
- 新增、复制、删除基础节点。
- 使用 `vn-core` 预览当前内存项目。
- 导出当前项目为 `ProjectBundle` JSON。
- 导入 `ProjectBundle` JSON 或裸 `VNProject` JSON。
- 重置为 demo 项目。
- 显示 dirty 状态和校验状态。
- 新增、编辑、删除素材元数据。
- 新增、编辑、删除角色和角色表情。
- 在节点属性面板中通过下拉框选择背景、角色、表情和音频。
- Web 导出视图展示导出校验、素材引用、规范化导出路径，并可导出 `project.bundle.json`。

Web 导出限制：

- 当前 Web 编辑器只负责 ProjectBundle JSON 和导出校验。
- 当前 Web 编辑器不能选择任意本地导出目录。
- 当前 Web 编辑器不能复制任意本地素材文件。
- 完整静态游戏目录导出由命令行 `pnpm export:demo-web` 验证，后续 Tauri 阶段再接真实文件系统。

通用限制：

- 不实现拖拽排序。
- 不实现节点图。
- 不接真实 Tauri 文件系统。
- 不做真实磁盘工程保存；导入导出通过浏览器 Web 文件能力完成。
- 素材仍是路径元数据，不管理真实图片或音频文件。
- 预览仍是文字化调试预览，不做真实渲染或播放。
## 工作流增强

编辑器支持多脚本管理、入口脚本设置、节点上移/下移、内部复制/剪切/粘贴、撤销/重做、节点搜索、节点类型筛选、校验结果点击定位和基础快捷键。复杂编辑逻辑集中在 `src/services` 与 `src/stores`，组件层只负责展示和触发操作。

快捷键包括 `Ctrl+S`、`Ctrl+Z`、`Ctrl+Y` / `Ctrl+Shift+Z`、`Ctrl+C`、`Ctrl+X`、`Ctrl+V`、`Delete` 和 `Ctrl+F`。输入框和文本域聚焦时会保留正常文本编辑行为。
## 演出编辑与画面预览

节点属性面板支持编辑 `SceneNode` 转场、`ShowCharacterNode` 位置/缩放/透明度/层级/翻转/入场效果、`HideCharacterNode` 退场效果、`CameraNode` 镜头参数，以及对话/旁白文本表现字段。预览区提供“调试预览”和“画面预览”两种模式；画面预览复用 `vn-renderer-pixi`，不播放真实音频。

## 变量和逻辑编辑

编辑器新增变量管理视图，可新增、编辑和删除项目级变量。`SetVariableNode` 可以从变量列表选择变量和 `set/add/subtract` 运算符；`ConditionNode` 提供结构化条件编辑入口；`TargetSelector` 可选择脚本内节点或标签作为跳转目标；节点工具栏支持新增 `LabelNode`。调试预览会显示当前变量值和最近运行时逻辑日志。
## 代码型动画节点编辑

编辑器现在支持新增和编辑 `PlayAnimationNode`。节点工具栏的“新增动画”会创建一个代码型动画节点，属性面板从 `vn-renderer-pixi` 的 `AnimationRegistry` 读取动画元数据，并根据 `targetSlots`、`paramsSchema` 自动生成目标和参数表单。

当前动画模块编辑只保存 `animationId`、`targets`、`params`、`waitForCompletion` 和 `autoNext` 到项目 JSON。编辑器不会保存动画代码，也不会执行来自不可信来源的任意 JS。自定义动画代码需要放在 renderer 的可信代码目录中并经过 typecheck/build。

## Showcase Demo

编辑器顶部“项目操作”菜单提供“加载 Showcase Demo”。它会从 `examples/showcase-game` 读取完整项目和 `scripts/start.vn.json`，用于检查素材库、变量、剧情节点、动画节点和预览链路。

## 物品编辑

编辑器素材库支持 `prop` 类型；节点工具栏支持新增物品显示和物品隐藏；属性面板可编辑 prop 资源、坐标、缩放、透明度、层级、旋转、翻转和入退场动画。PlayAnimationNode 的目标选择也支持 prop。
