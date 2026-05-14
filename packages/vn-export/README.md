# @vn-engine/vn-export

该包提供 Web 游戏导出前的纯逻辑能力，不依赖 Vue、DOM、Tauri、PixiJS 或 Audio API。

当前能力：

- 收集 `VNProject.assets.items` 中的素材引用。
- 将浏览器可访问素材路径规范化为导出包相对路径。
- 校验项目是否适合导出，包括 schema 校验、空素材路径和危险路径检查。
- 生成 `WebExportManifest`，记录项目、导出包路径、素材引用和警告。

当前阶段只负责导出逻辑和清单，不复制真实本地文件。命令行脚本 `pnpm export:demo-web` 会基于 demo 素材和 `apps/player/dist` 生成可静态部署的 demo Web 游戏目录。

限制：

- 不生成 zip。
- 不接 Tauri 文件系统。
- 不支持任意本地绝对路径素材复制。
- 不把素材二进制或 base64 写进项目 JSON。
