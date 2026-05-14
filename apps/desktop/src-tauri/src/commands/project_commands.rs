use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

use crate::utils::file_utils::{list_files_with_extension, write_text_atomic};
use crate::ProjectState;

const PROJECT_FILE_NAME: &str = "project.vnproj.json";
const STANDARD_DIRS: &[&str] = &[
    "scripts",
    "assets/background",
    "assets/character",
    "assets/audio/bgm",
    "assets/audio/sound",
    "assets/audio/voice",
    "assets/image",
    "assets/video",
];

/** 桌面端脚本文件载荷。 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptFilePayload {
    /** 脚本文件名。 */
    pub file_name: String,
    /** 脚本 JSON 文本。 */
    pub json_text: String,
}

/** 打开或创建工程后的读取结果。 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectOpenResult {
    /** 当前工程根目录绝对路径，仅用于桌面 UI 显示，不写入项目 JSON。 */
    pub root_path: String,
    /** project.vnproj.json 文本。 */
    pub project_json: String,
    /** 脚本 JSON 文本列表。 */
    pub scripts: Vec<ScriptFilePayload>,
}

fn set_current_root(state: &State<ProjectState>, root: PathBuf) -> Result<(), String> {
    let mut guard = state.root.lock().map_err(|_| "工程状态锁定失败。".to_string())?;
    *guard = Some(root);
    Ok(())
}

fn current_root(state: &State<ProjectState>) -> Result<PathBuf, String> {
    let guard = state.root.lock().map_err(|_| "工程状态锁定失败。".to_string())?;
    guard.clone().ok_or_else(|| "尚未打开本地工程。".to_string())
}

fn ensure_project_dirs(root: &Path) -> Result<(), String> {
    for dir in STANDARD_DIRS {
        fs::create_dir_all(root.join(dir)).map_err(|error| format!("创建工程目录失败：{error}"))?;
    }
    Ok(())
}

fn read_project_from_root(root: &Path) -> Result<ProjectOpenResult, String> {
    let project_path = root.join(PROJECT_FILE_NAME);
    if !project_path.exists() {
        return Err("所选目录不是有效工程：缺少 project.vnproj.json。".to_string());
    }

    let project_json = fs::read_to_string(&project_path).map_err(|error| format!("读取工程文件失败：{error}"))?;
    let scripts_dir = root.join("scripts");
    let mut scripts = Vec::new();
    for script_path in list_files_with_extension(&scripts_dir, "json")? {
        let file_name = script_path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("script.vn.json")
            .to_string();
        if !file_name.ends_with(".vn.json") {
            continue;
        }
        let json_text = fs::read_to_string(&script_path).map_err(|error| format!("读取脚本文件失败：{error}"))?;
        scripts.push(ScriptFilePayload { file_name, json_text });
    }

    Ok(ProjectOpenResult {
        root_path: root.to_string_lossy().to_string(),
        project_json,
        scripts,
    })
}

/** 新建本地视觉小说工程目录。 */
#[tauri::command]
pub fn create_project_directory(app: AppHandle, state: State<ProjectState>) -> Result<ProjectOpenResult, String> {
    let Some(root_value) = app.dialog().file().set_title("选择新建工程目录").blocking_pick_folder() else {
        return Err("已取消选择工程目录。".to_string());
    };
    let root = root_value.into_path().map_err(|error| format!("无法读取工程目录路径：{error}"))?;

    ensure_project_dirs(&root)?;
    let project_path = root.join(PROJECT_FILE_NAME);
    if !project_path.exists() {
        let default_project = r#"{
  "id": "desktop-project",
  "name": "新视觉小说工程",
  "version": "0.1.0",
  "startScriptId": "start",
  "assets": { "items": [] },
  "characters": [],
  "scripts": [
    { "id": "start", "name": "开始", "path": "scripts/start.vn.json" }
  ]
}"#;
        let default_script = r#"{
  "id": "start",
  "name": "开始",
  "nodes": [
    { "type": "narration", "id": "start_intro", "text": "这是一个新的视觉小说工程。" }
  ]
}"#;
        write_text_atomic(&project_path, default_project)?;
        write_text_atomic(&root.join("scripts/start.vn.json"), default_script)?;
    }

    set_current_root(&state, root.clone())?;
    read_project_from_root(&root)
}

/** 打开已有本地视觉小说工程目录。 */
#[tauri::command]
pub fn open_project_directory(app: AppHandle, state: State<ProjectState>) -> Result<ProjectOpenResult, String> {
    let Some(root_value) = app.dialog().file().set_title("打开视觉小说工程目录").blocking_pick_folder() else {
        return Err("已取消打开工程目录。".to_string());
    };
    let root = root_value.into_path().map_err(|error| format!("无法读取工程目录路径：{error}"))?;

    let result = read_project_from_root(&root)?;
    set_current_root(&state, root)?;
    Ok(result)
}

/** 读取当前工程入口文件。 */
#[tauri::command]
pub fn read_project_file(state: State<ProjectState>) -> Result<String, String> {
    let root = current_root(&state)?;
    fs::read_to_string(root.join(PROJECT_FILE_NAME)).map_err(|error| format!("读取工程文件失败：{error}"))
}

/** 读取当前工程脚本文件列表。 */
#[tauri::command]
pub fn read_script_files(state: State<ProjectState>) -> Result<Vec<ScriptFilePayload>, String> {
    let root = current_root(&state)?;
    read_project_from_root(&root).map(|result| result.scripts)
}

/** 保存当前工程入口文件。 */
#[tauri::command]
pub fn save_project_file(state: State<ProjectState>, project_json: String) -> Result<(), String> {
    let root = current_root(&state)?;
    write_text_atomic(&root.join(PROJECT_FILE_NAME), &project_json)
}

/** 保存当前工程脚本文件列表。 */
#[tauri::command]
pub fn save_script_files(state: State<ProjectState>, scripts: Vec<ScriptFilePayload>) -> Result<(), String> {
    let root = current_root(&state)?;
    let scripts_dir = root.join("scripts");
    fs::create_dir_all(&scripts_dir).map_err(|error| format!("创建脚本目录失败：{error}"))?;
    for script in scripts {
        let path = scripts_dir.join(script.file_name);
        write_text_atomic(&path, &script.json_text)?;
    }
    Ok(())
}

/** 获取当前打开的工程根目录。 */
#[tauri::command]
pub fn get_current_project_root(state: State<ProjectState>) -> Result<Option<String>, String> {
    let guard = state.root.lock().map_err(|_| "工程状态锁定失败。".to_string())?;
    Ok(guard.as_ref().map(|path| path.to_string_lossy().to_string()))
}
