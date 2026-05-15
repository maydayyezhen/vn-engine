import type { AssetType } from "@vn-engine/vn-schema";

/** 本地视觉小说工程入口文件名。 */
export const PROJECT_FILE_NAME = "project.vnproj.json";

/** 本地视觉小说工程脚本目录名。 */
export const SCRIPTS_DIRECTORY_NAME = "scripts";

/** 本地视觉小说工程素材根目录名。 */
export const ASSETS_DIRECTORY_NAME = "assets";

/** 本地视觉小说工程标准目录布局。 */
export interface ProjectDirectoryLayout {
  /** 工程入口文件相对路径。 */
  projectFile: string;
  /** 剧本文件目录相对路径。 */
  scriptsDir: string;
  /** 素材根目录相对路径。 */
  assetsDir: string;
  /** 背景图素材目录相对路径。 */
  backgroundDir: string;
  /** 角色立绘素材目录相对路径。 */
  characterDir: string;
  /** 物品素材目录相对路径。 */
  propDir: string;
  /** BGM 素材目录相对路径。 */
  bgmDir: string;
  /** 音效素材目录相对路径。 */
  soundDir: string;
  /** 语音素材目录相对路径。 */
  voiceDir: string;
  /** 通用图片素材目录相对路径。 */
  imageDir: string;
  /** 预留视频素材目录相对路径。 */
  videoDir: string;
}

/** 本地视觉小说工程标准目录布局常量。 */
export const PROJECT_DIRECTORY_LAYOUT: ProjectDirectoryLayout = {
  projectFile: PROJECT_FILE_NAME,
  scriptsDir: SCRIPTS_DIRECTORY_NAME,
  assetsDir: ASSETS_DIRECTORY_NAME,
  backgroundDir: "assets/background",
  characterDir: "assets/character",
  propDir: "assets/prop",
  bgmDir: "assets/audio/bgm",
  soundDir: "assets/audio/sound",
  voiceDir: "assets/audio/voice",
  imageDir: "assets/image",
  videoDir: "assets/video"
};

/** 新建工程时需要创建的标准目录列表。 */
export const STANDARD_PROJECT_DIRECTORIES = [
  PROJECT_DIRECTORY_LAYOUT.scriptsDir,
  PROJECT_DIRECTORY_LAYOUT.backgroundDir,
  PROJECT_DIRECTORY_LAYOUT.characterDir,
  PROJECT_DIRECTORY_LAYOUT.propDir,
  PROJECT_DIRECTORY_LAYOUT.bgmDir,
  PROJECT_DIRECTORY_LAYOUT.soundDir,
  PROJECT_DIRECTORY_LAYOUT.voiceDir,
  PROJECT_DIRECTORY_LAYOUT.imageDir,
  PROJECT_DIRECTORY_LAYOUT.videoDir
];

/** 根据素材类型返回工程内推荐存放目录。 */
export function getAssetDirectoryForType(type: AssetType): string {
  if (type === "background") return PROJECT_DIRECTORY_LAYOUT.backgroundDir;
  if (type === "character") return PROJECT_DIRECTORY_LAYOUT.characterDir;
  if (type === "prop") return PROJECT_DIRECTORY_LAYOUT.propDir;
  if (type === "bgm") return PROJECT_DIRECTORY_LAYOUT.bgmDir;
  if (type === "sound" || type === "sfx") return PROJECT_DIRECTORY_LAYOUT.soundDir;
  if (type === "voice") return PROJECT_DIRECTORY_LAYOUT.voiceDir;
  if (type === "image") return PROJECT_DIRECTORY_LAYOUT.imageDir;
  return PROJECT_DIRECTORY_LAYOUT.assetsDir;
}
