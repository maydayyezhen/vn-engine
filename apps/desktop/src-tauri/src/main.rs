mod commands;
mod utils;

use std::path::PathBuf;
use std::sync::Mutex;

use commands::asset_commands::{copy_asset_to_project, import_asset_file, reveal_asset_in_folder, select_asset_file};
use commands::export_commands::{export_web_game, select_export_directory};
use commands::project_commands::{
    create_project_directory, get_current_project_root, open_project_directory, read_project_file, read_script_files,
    save_project_file, save_script_files,
};

/** 当前桌面会话中的本地工程状态。 */
pub struct ProjectState {
    /** 当前打开的工程根目录。 */
    root: Mutex<Option<PathBuf>>,
}

impl Default for ProjectState {
    fn default() -> Self {
        Self {
            root: Mutex::new(None),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(ProjectState::default())
        .invoke_handler(tauri::generate_handler![
            create_project_directory,
            open_project_directory,
            read_project_file,
            read_script_files,
            save_project_file,
            save_script_files,
            get_current_project_root,
            select_asset_file,
            copy_asset_to_project,
            import_asset_file,
            reveal_asset_in_folder,
            select_export_directory,
            export_web_game
        ])
        .run(tauri::generate_context!())
        .expect("failed to run VN Engine desktop app");
}
