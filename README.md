# vn-engine

本项目是一个本地优先的视觉小说引擎与编辑器骨架，用于制作 Galgame/视觉小说。

当前阶段聚焦稳定的数据结构、最小运行时解释器、demo player 和编辑器骨架。项目不包含后端、不包含数据库、不实现自定义脚本语言，也不实现节点图编辑器。

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

## 运行编辑器骨架

```bash
pnpm dev:editor
```

默认地址：

```text
http://localhost:5174/
```

当前编辑器支持内存态编辑 demo 剧本：

- 切换脚本。
- 选择节点并编辑基础字段。
- 新增对话节点和旁白节点。
- 复制、删除当前节点。
- 显示工程校验结果。
- 使用 `vn-core` 在底部预览最新内存项目。

## 测试

```bash
pnpm test
```

当前测试覆盖 `vn-core` 的 start、next、choice、jump、条件分支、demo 工程校验、两个结局结束态，以及 `getState/loadState` 的基础恢复能力。

## 类型检查

```bash
pnpm typecheck
```

## 构建

```bash
pnpm build
```

## 架构边界

- `packages/vn-schema` 定义工程数据结构与基础校验。
- `packages/vn-core` 实现与 Vue、DOM、PixiJS、Tauri 解耦的运行时解释器。
- `apps/player` 读取 demo 工程数据并展示 `RuntimeSnapshot`，第一阶段不使用 Element Plus。
- `apps/editor` 使用 Vue3、Vite、TypeScript、Element Plus 搭建编辑器骨架。
- `apps/desktop` 仅预留未来 Tauri 桌面壳说明。
- `packages/vn-renderer-pixi` 仅预留未来 PixiJS 渲染适配。

## 当前限制

- 不包含后端。
- 不包含数据库。
- 不接真实 Tauri 文件系统。
- 不做节点图编辑器。
- 不实现自定义脚本语言。
- 不引入大型状态机库。
