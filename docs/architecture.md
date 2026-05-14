# 架构说明

## 第十轮更新：Tauri 桌面闭环

`apps/desktop` 已提供 Tauri 命令层：新建/打开/保存工程、选择并复制素材、导出完整 Web 游戏包。它加载 `apps/editor` 作为界面，编辑器通过 `src/desktop/*Bridge.ts` 集中调用 Tauri 命令。Web 模式下桥接层返回明确错误，页面不会因为缺少 Tauri API 白屏。

本地工程采用 `project.vnproj.json`、`scripts/` 和 `assets/` 的目录结构。素材导入时先复制到工程目录，再把 `assets/...` 相对路径写入项目 JSON。绝对路径、外部 URL 和 `../` 逃逸路径会被路径策略拒绝。

## 整体架构

`vn-engine` 是本地优先的视觉小说引擎与编辑器 monorepo。工程分为应用层和核心包层：

- `apps/editor` 是编辑器界面，负责展示和修改工程数据。
- `apps/player` 是播放器，负责读取工程数据、驱动运行时、承载 PixiJS 舞台和同步音频。
- `apps/desktop` 未来作为 Tauri 桌面壳，只提供本地文件能力。
- `packages/vn-schema` 定义工程数据结构和校验规则。
- `packages/vn-core` 执行剧情解释，不依赖 UI、PixiJS、Audio API 或 Tauri。
- `packages/vn-project` 提供项目序列化、反序列化和深拷贝。
- `packages/vn-renderer-pixi` 接收 `RuntimeSnapshot` 和 `VNProject`，负责 PixiJS 画面渲染。
- `packages/vn-audio` 接收 `RuntimeSnapshot` 和 `VNProject`，负责浏览器端音频播放同步。
- `packages/vn-ui-runtime` 沉淀运行时 UI 纯逻辑，包括存档、历史、设置和自动播放控制。
- `packages/vn-export` 提供 Web 导出前的纯逻辑，包括素材引用收集、路径规范化、导出校验和导出清单。
- `packages/vn-compiler` 未来可选实现脚本文法转换。

## 为什么 schema、core、renderer、audio、editor 要分离

`schema` 是数据契约，`core` 是解释器，`renderer` 是画面适配，`audio` 是音频播放适配，`editor` 是数据编辑界面。分离后，运行时可以被播放器、编辑器预览和测试工具共同复用，不会被 Vue 页面、PixiJS、Audio API 或桌面壳绑定。

## 为什么数据是中心

视觉小说工程的核心资产是结构化数据：素材、角色、表情、脚本、节点、变量和跳转关系。只要数据结构稳定，编辑器、播放器、桌面壳和导出工具都可以围绕同一份工程数据演进。

## 为什么 vn-core 只维护音频状态

`vn-core` 只解释 `PlayAudioNode` 和 `StopAudioNode`，并把结果写入 `RuntimeSnapshot.audio`。它不创建 `HTMLAudioElement`，不播放文件，不处理浏览器自动播放策略。播放器把快照交给 `vn-audio`，由 `vn-audio` 按资源元数据同步真实播放。

## 为什么 renderer 不负责音频

`vn-renderer-pixi` 只负责画面。音频不应该塞进 Pixi 渲染层，否则画面生命周期、音频策略和剧情推进会耦合。当前由 `apps/player` 同时把快照交给 renderer 和 audio manager。

## 为什么运行时 UI 逻辑独立为 vn-ui-runtime

存档、历史记录、设置和自动播放属于播放器运行时体验，但不应该直接写死在 Vue 组件里。`vn-ui-runtime` 提供纯 TypeScript 工具：存档槽结构、存档存储、历史管理、设置读写和自动播放控制。`apps/player` 只负责把这些逻辑接到 Vue 状态、`localStorage`、`VNRuntime` 和音频管理器。

## localStorage 的边界

当前播放器的存档、设置和已读记录使用浏览器 `localStorage`，用于 Web demo 阶段验证运行时 UI 闭环。它不替代未来 Tauri 本地工程文件系统，也不会把存档写入项目 JSON。后续桌面阶段再处理项目目录、素材复制、导出包和更完整的存档位置。

## Web 导出包边界

当前 `packages/vn-export` 不读取真实文件系统，也不复制任意本地素材。它只负责判断项目是否适合导出、规范化资源路径、收集资源引用并生成导出清单。命令行脚本 `pnpm export:demo-web` 在 Web demo 阶段负责把 `apps/player/dist`、`ProjectBundle` 和 demo 素材复制到 `dist/export/demo-web-game/`。完整的本地素材复制、选择导出目录和打包流程留到 Tauri 阶段。

## 为什么编辑器只是修改数据

编辑器不应该成为业务逻辑中心。它的职责是展示数据、触发操作、调用 service 或 store 修改数据。节点编辑、素材编辑、角色编辑、导入导出和运行预览都放在独立服务或核心包中，便于后续替换 UI 或接入 Tauri。

## 为什么播放器只是读取数据

播放器读取项目数据、驱动 `VNRuntime`、把 `RuntimeSnapshot` 交给渲染器和音频同步器。它不保存工程，不编辑节点，也不直接解析底层文件结构。

## 素材准备原则

项目 JSON 只保存资源 id、名称、类型、路径和说明，不保存素材二进制，也不使用 base64。Web demo 阶段素材放在 `apps/player/public/demo-assets/`，路径写成 `/demo-assets/...`。未来 Tauri 阶段再负责选择本地文件、复制到工程 `assets` 目录、生成相对路径并更新项目资源元数据。

## 为什么 Tauri 只负责本地能力

Tauri 的职责是打开文件夹、读写文件、导入素材、导出游戏包和调用系统文件选择器。剧情解释、数据校验、素材引用规则和编辑器业务逻辑应留在 TypeScript 核心包和服务中。

## 为什么编辑器预览仍是文字化调试预览

PixiJS 渲染和真实音频播放只接入正式播放器。编辑器底部预览继续展示运行时快照和资源解析结果，避免把复杂渲染或音频生命周期塞进编辑器布局。

## 为什么不做节点图编辑器

节点图会引入拖拽、布局、连线、视口、选择状态和大量交互细节，容易掩盖更重要的数据结构和运行时稳定性。当前阶段先用节点列表验证数据和运行时。

## 为什么不做自定义脚本语言

自定义脚本语言需要 parser、错误定位、语法设计和编译产物映射。当前统一使用结构化 JSON，可以更快稳定 `StoryNode` 数据模型和运行时行为。

## 为什么 Element Plus 只用于编辑器

Element Plus 适合编辑器中的表单、树、列表、弹窗和面板，但不应该污染核心包、renderer、audio 或播放器。核心包必须 UI 解耦，播放器也不应该呈现后台管理风格。
