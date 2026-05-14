# @vn-engine/vn-project

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
