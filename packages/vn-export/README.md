# @vn-engine/vn-export

## 桌面导出配合

`createProjectAssetExportPlan(project)` 会根据项目素材库生成纯逻辑复制计划，包含工程内源路径和 Web 导出包内目标路径。真实文件复制由 `apps/desktop` 的 Tauri 命令或 Node 脚本完成，`vn-export` 不直接读取本地文件系统。

导出校验会阻止空路径、绝对路径、外部 URL 和 `../` 逃逸路径，避免把用户电脑上的本地绝对路径写入导出包清单。

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
## Showcase Web 导出

根目录脚本 `pnpm export:showcase-web` 会把 `apps/player/dist`、Showcase 的 `ProjectBundle`、`game/export-manifest.json`、`game/CREDITS.md` 和 `apps/player/public/showcase-assets` 复制到 `dist/export/showcase-web-game/`。

导出包仍需要通过静态服务器运行，不建议直接双击 `index.html`。当前 Showcase 使用 `/showcase-assets/...` 浏览器路径；真实素材替换后也需要保持导出包内路径可访问。

## Prop 导出

Web 导出会把素材库中的 prop 资源作为普通素材引用收集到 manifest，并在导出包中按路径复制，项目 JSON 只保存资源元数据和路径。
