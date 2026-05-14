# @vn-engine/vn-project

该包负责视觉小说项目导入导出前的纯逻辑层，不依赖 Vue、Element Plus、DOM 或 Tauri。

当前能力：

- `serializeProject(project)`：将完整 `VNProject` 序列化为格式化 JSON。
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

当前导入导出仍是 Web 编辑器内的 JSON 文件能力，不是 Tauri 本地工程目录读写。下一阶段可以在 desktop 壳中复用本包逻辑，接入真实文件夹打开、保存和素材导入。
