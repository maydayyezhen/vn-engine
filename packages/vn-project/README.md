# @vn-engine/vn-project

## 本地工程目录纯逻辑

当前包提供桌面工程读写前的纯逻辑工具：

- `PROJECT_DIRECTORY_LAYOUT`：标准工程目录布局。
- `STANDARD_PROJECT_DIRECTORIES`：新建工程时需要创建的目录列表。
- `getAssetDirectoryForType(type)`：按素材类型返回推荐存放目录。
- `normalizeProjectAssetPath(path)`：校验并规范化工程内相对素材路径。
- `splitProjectScripts(project)`：将完整 `VNProject` 拆成工程主文件和脚本文件。
- `mergeProjectScripts(projectFile, scripts)`：将工程主文件和脚本文件合并为完整项目。
- `createDefaultProject()`：创建可通过基础校验的新工程初始数据。

路径策略会拒绝 Windows/POSIX 绝对路径、外部 URL 和 `../` 逃逸路径。项目 JSON 只应保存工程内相对路径。

该包负责视觉小说项目导入导出前的纯逻辑层，不依赖 Vue、Element Plus、DOM 或 Tauri。

当前能力：

- `serializeProject(project)`：将完整 `VNProject` 序列化为格式化 `ProjectBundle` JSON。
- `deserializeProject(jsonText)`：从 `ProjectBundle` 或裸 `VNProject` JSON 中解析工程。
- `cloneProject(project)`：深拷贝工程数据，去除响应式代理。
- `PROJECT_FORMAT`：当前固定为 `vn-engine-project`。
- `PROJECT_FORMAT_VERSION`：当前固定为 `0.1.0`。

## ProjectBundle

```ts
interface ProjectBundle {
  format: "vn-engine-project";
  formatVersion: string;
  exportedAt: string;
  project: VNProject;
}
```

`ProjectBundle.project` 会完整保留脚本、素材库、角色和角色表情映射。播放器导出的 Web 游戏包会把它放在 `game/project.bundle.json`，`apps/player` 启动时优先读取该文件。

当前导入导出仍是 JSON 纯逻辑，不负责复制素材文件，也不是 Tauri 本地工程目录读写。后续桌面壳会复用本包逻辑，接入真实文件夹打开、保存和素材导入。
## 脚本管理纯逻辑

`vn-project` 现在提供多脚本编辑所需的纯逻辑辅助函数，包括创建安全脚本 id、创建脚本、确保项目至少有一个脚本、选择兜底脚本、重命名脚本、删除脚本和设置入口脚本。这些函数不依赖 Vue、Element Plus、DOM 或 Tauri，可同时供 Web 编辑器和桌面编辑器使用。
