use std::path::{Component, Path, PathBuf};

/** 将路径转换为项目 JSON 使用的正斜杠形式。 */
pub fn to_project_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

/** 判断用户输入路径是否包含上级目录逃逸。 */
pub fn contains_parent_component(path: &Path) -> bool {
    path.components().any(|component| matches!(component, Component::ParentDir))
}

/** 校验相对路径并拼到工程根目录下。 */
pub fn resolve_inside_root(root: &Path, relative_path: &str) -> Result<PathBuf, String> {
    let candidate = PathBuf::from(relative_path);
    if candidate.is_absolute() || contains_parent_component(&candidate) {
        return Err("路径必须是工程内相对路径，不能是绝对路径或包含上级目录。".to_string());
    }
    Ok(root.join(candidate))
}

/** 根据素材类型返回工程内目标子目录。 */
pub fn asset_subdir(asset_type: &str) -> &'static str {
    match asset_type {
        "background" => "assets/background",
        "character" => "assets/character",
        "bgm" => "assets/audio/bgm",
        "sound" | "sfx" => "assets/audio/sound",
        "voice" => "assets/audio/voice",
        "image" => "assets/image",
        _ => "assets",
    }
}

/** 为复制进工程的文件生成安全文件名。 */
pub fn safe_file_name(path: &Path) -> Result<String, String> {
    let name = path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "无法读取素材文件名。".to_string())?;
    let sanitized: String = name
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-' | '_' | ' ') {
                ch
            } else {
                '_'
            }
        })
        .collect();
    if sanitized.trim().is_empty() {
        return Err("素材文件名不能为空。".to_string());
    }
    Ok(sanitized)
}
