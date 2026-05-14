# @vn-engine/vn-ui-runtime

该包提供播放器运行时 UI 的纯逻辑工具，不依赖 Vue、Element Plus、PixiJS、Audio API 或 Tauri。

当前能力：

- `SaveSlot`、`SaveStorage`：基于键值存储接口保存、读取、删除和清空存档。
- `createSavePreview`：从 `RuntimeSnapshot` 和 `RuntimeState` 生成存档预览。
- `HistoryManager`：维护会话历史，限制最大条数并避免连续重复记录。
- `RuntimeSettings`、`SettingsStorage`：读取、保存和容错恢复播放器设置。
- `AutoPlayController`：根据快照安排自动下一步，遇到选项或结束状态自动暂停。

当前 `apps/player` 使用浏览器 `localStorage` 适配存档和设置。该能力只是 Web demo 阶段的本地持久化，不是 Tauri 本地工程文件系统。

限制：

- 不提供 Vue 组件。
- 不保存完整 `VNProject`。
- 不保存图片、音频或视频二进制。
- 不实现复杂存档兼容迁移。
