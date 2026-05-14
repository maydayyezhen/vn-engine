use std::fs;
use std::path::{Path, PathBuf};

/** 使用临时文件写入并替换目标文件，降低保存中断导致文件损坏的风险。 */
pub fn write_text_atomic(path: &Path, text: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("创建目录失败：{error}"))?;
    }
    let tmp_path = path.with_extension("tmp");
    fs::write(&tmp_path, text).map_err(|error| format!("写入临时文件失败：{error}"))?;
    fs::rename(&tmp_path, path).map_err(|error| format!("替换目标文件失败：{error}"))?;
    Ok(())
}

/** 复制目录树。 */
pub fn copy_dir_all(source: &Path, target: &Path) -> Result<(), String> {
    if !source.exists() {
        return Err(format!("源目录不存在：{}", source.display()));
    }
    fs::create_dir_all(target).map_err(|error| format!("创建目标目录失败：{error}"))?;
    for entry in fs::read_dir(source).map_err(|error| format!("读取源目录失败：{error}"))? {
        let entry = entry.map_err(|error| format!("读取目录项失败：{error}"))?;
        let file_type = entry.file_type().map_err(|error| format!("读取文件类型失败：{error}"))?;
        let next_target = target.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &next_target)?;
        } else {
            fs::copy(entry.path(), next_target).map_err(|error| format!("复制文件失败：{error}"))?;
        }
    }
    Ok(())
}

/** 返回目录内扩展名匹配的文件。 */
pub fn list_files_with_extension(dir: &Path, extension: &str) -> Result<Vec<PathBuf>, String> {
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut files = Vec::new();
    for entry in fs::read_dir(dir).map_err(|error| format!("读取目录失败：{error}"))? {
        let entry = entry.map_err(|error| format!("读取目录项失败：{error}"))?;
        let path = entry.path();
        if path.extension().and_then(|value| value.to_str()) == Some(extension) {
            files.push(path);
        }
    }
    files.sort();
    Ok(files)
}
