# apps/desktop

该目录预留给未来 Tauri 桌面壳集成。

未来它负责：

- 打开本地项目文件夹
- 保存 `project.vnproj.json`
- 读取 `scripts/*.vn.json`
- 导入图片素材
- 导入音频素材
- 导出 Web 游戏包
- 调用系统文件选择器

第一阶段不写复杂 Rust 文件系统逻辑，也不让 desktop 成为业务逻辑中心。核心业务仍放在 schema、core、project 等包中。
