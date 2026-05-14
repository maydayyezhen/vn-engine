use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

use crate::utils::file_utils::{copy_dir_all, write_text_atomic};
use crate::utils::path_utils::{resolve_inside_root, to_project_path};
use crate::ProjectState;

/** 桌面端导出的素材复制计划。 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportAssetCopyPayload {
    /** 工程内素材相对路径。 */
    pub source_path: String,
    /** 导出包内素材相对路径。 */
    pub export_path: String,
}

/** 桌面端 Web 游戏包导出结果。 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopExportResult {
    /** 导出目录绝对路径。 */
    pub export_dir: String,
    /** 复制素材数量。 */
    pub copied_assets: usize,
}

fn current_root(state: &State<ProjectState>) -> Result<PathBuf, String> {
    let guard = state.root.lock().map_err(|_| "工程状态锁定失败。".to_string())?;
    guard.clone().ok_or_else(|| "尚未打开本地工程。".to_string())
}

fn find_player_dist_dir() -> Result<PathBuf, String> {
    let current = std::env::current_dir().map_err(|error| format!("读取当前目录失败：{error}"))?;
    let candidates = [
        current.join("apps/player/dist"),
        current.join("../player/dist"),
        current.join("../../player/dist"),
        current.join("../../apps/player/dist"),
    ];
    candidates
        .into_iter()
        .find(|path| path.join("index.html").exists())
        .ok_or_else(|| "未找到 apps/player/dist，请先执行 pnpm build。".to_string())
}

fn clean_output_dir(path: &Path) -> Result<(), String> {
    if path.exists() {
        fs::remove_dir_all(path).map_err(|error| format!("清理导出目录失败：{error}"))?;
    }
    fs::create_dir_all(path).map_err(|error| format!("创建导出目录失败：{error}"))?;
    Ok(())
}

/** 选择 Web 游戏包导出目录。 */
#[tauri::command]
pub fn select_export_directory(app: AppHandle) -> Result<Option<String>, String> {
    let path = app.dialog().file().set_title("选择 Web 游戏包导出目录").blocking_pick_folder();
    path.map(|value| {
        value
            .into_path()
            .map(|path| path.to_string_lossy().to_string())
            .map_err(|error| format!("无法读取导出目录路径：{error}"))
    })
    .transpose()
}

/** 导出当前工程为完整 Web 游戏包。 */
#[tauri::command]
pub fn export_web_game(
    state: State<ProjectState>,
    export_dir: String,
    project_bundle_json: String,
    export_manifest_json: String,
    asset_refs: Vec<ExportAssetCopyPayload>,
) -> Result<DesktopExportResult, String> {
    let root = current_root(&state)?;
    let output_dir = PathBuf::from(export_dir);
    let player_dist = find_player_dist_dir()?;

    clean_output_dir(&output_dir)?;
    copy_dir_all(&player_dist, &output_dir)?;

    let game_dir = output_dir.join("game");
    fs::create_dir_all(&game_dir).map_err(|error| format!("创建 game 目录失败：{error}"))?;
    write_text_atomic(&game_dir.join("project.bundle.json"), &project_bundle_json)?;
    write_text_atomic(&game_dir.join("export-manifest.json"), &export_manifest_json)?;
    write_text_atomic(
        &game_dir.join("README.md"),
        "请使用静态服务器运行该目录，不建议直接双击 index.html。\n",
    )?;

    let mut copied_assets = 0;
    for asset in asset_refs {
        let source = resolve_inside_root(&root, &asset.source_path)?;
        if !source.exists() {
            continue;
        }
        let target_relative = PathBuf::from(&asset.export_path);
        if target_relative.is_absolute() {
            return Err("导出素材路径不能是绝对路径。".to_string());
        }
        let target = output_dir.join(target_relative);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|error| format!("创建素材导出目录失败：{error}"))?;
        }
        fs::copy(&source, &target).map_err(|error| {
            format!(
                "复制素材失败：{} -> {}，{error}",
                to_project_path(&source),
                to_project_path(&target)
            )
        })?;
        copied_assets += 1;
    }

    Ok(DesktopExportResult {
        export_dir: output_dir.to_string_lossy().to_string(),
        copied_assets,
    })
}
