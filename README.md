# vn-engine

本项目是本地优先的视觉小说引擎与编辑器 monorepo，用于制作 Galgame/视觉小说。

当前阶段已经打通结构化 JSON 工程、运行时解释器、最小播放器、编辑器内存态编辑、JSON 导入导出、素材库元数据管理、角色与表情映射管理。项目不包含后端，不包含数据库，不实现自定义脚本语言，也不实现节点图编辑器。

## 环境

- Node.js 24 已验证可用。
- 包管理器使用 pnpm workspace。

## 安装依赖

```bash
pnpm install
```

## 运行播放器 demo

```bash
pnpm dev:player
```

默认地址：

```text
http://localhost:5173/
```

## 运行编辑器

```bash
pnpm dev:editor
```

默认地址：

```text
http://localhost:5174/
```

当前编辑器支持：

- 内存态编辑 demo 剧本节点。
- 新增对话和旁白节点，复制、删除当前节点。
- 使用下拉框选择背景、角色、角色表情和音频素材。
- 管理素材元数据，包括背景、角色图片、BGM、音效、语音等。
- 管理角色和角色表情到素材的映射。
- 使用 `vn-core` 在底部预览最新内存项目。
- 导出当前内存项目为 `ProjectBundle` JSON 文件。
- 从 `ProjectBundle` JSON 或裸 `VNProject` JSON 导入项目。
- 重置为 demo 项目。
- 显示 dirty 状态和校验状态。

## 测试

```bash
pnpm test
```

当前测试覆盖：

- `vn-schema` 的脚本、跳转、素材、角色和表情引用校验。
- `vn-core` 的 start、next、choice、jump、条件分支、两个 demo 结局和状态恢复。
- `vn-project` 的 JSON 序列化、反序列化、ProjectBundle 兼容和素材/角色数据保留。

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
- `packages/vn-core` 实现与 Vue、DOM、PixiJS、Tauri 解耦的运行时解释器。
- `packages/vn-project` 提供项目序列化、反序列化和深拷贝纯逻辑。
- `apps/player` 读取 demo 工程数据并展示 `RuntimeSnapshot`，不使用 Element Plus。
- `apps/editor` 使用 Vue3、Vite、TypeScript、Element Plus 搭建编辑器。
- `apps/desktop` 仅预留未来 Tauri 桌面壳说明。
- `packages/vn-renderer-pixi` 仅预留未来 PixiJS 渲染适配。

## 当前限制

- 不包含后端。
- 不包含数据库。
- 不接真实 Tauri 文件系统。
- 素材仍是路径元数据，不管理真实图片或音频二进制文件。
- 预览仍是文字化调试预览，不做真实图片渲染或音频播放。
- 不做节点图编辑器。
- 不实现自定义脚本语言。
