use std::fs;
use std::path::PathBuf;
use std::process::Command;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

use crate::utils::path_utils::{asset_subdir, resolve_inside_root, safe_file_name, to_project_path};
use crate::ProjectState;

/** 素材导入结果。 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportedAssetResult {
    /** 原始素材文件绝对路径，仅用于本次桌面操作回显。 */
    pub source_path: String,
    /** 复制进工程后的工程内相对路径。 */
    pub relative_path: String,
}

fn current_root(state: &State<ProjectState>) -> Result<PathBuf, String> {
    let guard = state.root.lock().map_err(|_| "工程状态锁定失败。".to_string())?;
    guard.clone().ok_or_else(|| "尚未打开本地工程。".to_string())
}

fn asset_extensions(asset_type: &str) -> Vec<&'static str> {
    match asset_type {
        "bgm" | "sound" | "sfx" | "voice" => vec!["mp3", "wav", "ogg", "flac"],
        _ => vec!["png", "jpg", "jpeg", "webp", "svg"],
    }
}

fn copy_asset(root: PathBuf, source_path: PathBuf, asset_type: &str) -> Result<ImportedAssetResult, String> {
    if !source_path.exists() || !source_path.is_file() {
        return Err("素材文件不存在。".to_string());
    }
    let target_dir = root.join(asset_subdir(asset_type));
    fs::create_dir_all(&target_dir).map_err(|error| format!("创建素材目录失败：{error}"))?;

    let safe_name = safe_file_name(&source_path)?;
    let mut target = target_dir.join(&safe_name);
    if target.exists() {
        let stem = source_path.file_stem().and_then(|value| value.to_str()).unwrap_or("asset");
        let ext = source_path.extension().and_then(|value| value.to_str()).unwrap_or("");
        let suffix = Uuid::new_v4().to_string()[..8].to_string();
        let file_name = if ext.is_empty() {
            format!("{stem}-{suffix}")
        } else {
            format!("{stem}-{suffix}.{ext}")
        };
        target = target_dir.join(file_name);
    }

    fs::copy(&source_path, &target).map_err(|error| format!("复制素材失败：{error}"))?;
    let relative = target.strip_prefix(&root).map_err(|_| "无法生成工程内相对路径。".to_string())?;
    Ok(ImportedAssetResult {
        source_path: source_path.to_string_lossy().to_string(),
        relative_path: to_project_path(relative),
    })
}

/** 使用系统文件选择器选择素材文件。 */
#[tauri::command]
pub fn select_asset_file(app: AppHandle, asset_type: String) -> Result<Option<String>, String> {
    let extensions = asset_extensions(&asset_type);
    let path = app
        .dialog()
        .file()
        .set_title("选择素材文件")
        .add_filter("Asset", &extensions)
        .blocking_pick_file();
    path.map(|value| {
        value
            .into_path()
            .map(|path| path.to_string_lossy().to_string())
            .map_err(|error| format!("无法读取素材路径：{error}"))
    })
    .transpose()
}

/** 将指定素材文件复制到当前工程素材目录。 */
#[tauri::command]
pub fn copy_asset_to_project(
    state: State<ProjectState>,
    source_path: String,
    asset_type: String,
) -> Result<ImportedAssetResult, String> {
    let root = current_root(&state)?;
    copy_asset(root, PathBuf::from(source_path), &asset_type)
}

/** 选择素材并复制到当前工程素材目录。 */
#[tauri::command]
pub fn import_asset_file(app: AppHandle, state: State<ProjectState>, asset_type: String) -> Result<ImportedAssetResult, String> {
    let source_path = select_asset_file(app, asset_type.clone())?.ok_or_else(|| "已取消选择素材文件。".to_string())?;
    let root = current_root(&state)?;
    copy_asset(root, PathBuf::from(source_path), &asset_type)
}

/** 在系统文件管理器中定位工程内素材文件。 */
#[tauri::command]
pub fn reveal_asset_in_folder(state: State<ProjectState>, relative_path: String) -> Result<(), String> {
    let root = current_root(&state)?;
    let target = resolve_inside_root(&root, &relative_path)?;
    if cfg!(target_os = "windows") {
        Command::new("explorer")
            .arg("/select,")
            .arg(target)
            .spawn()
            .map_err(|error| format!("打开资源管理器失败：{error}"))?;
    }
    Ok(())
}
