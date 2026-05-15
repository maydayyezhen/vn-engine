import { mkdir, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const showcaseDir = path.join(rootDir, "examples/showcase-game");
const sourceAssetsDir = path.join(showcaseDir, "assets");
const publicAssetsDir = path.join(rootDir, "apps/player/public/showcase-assets");

const requiredFiles = [
  "background/station_evening.webp",
  "background/classroom_day.webp",
  "background/hallway_day.webp",
  "background/seaside_night.webp",
  "character/heroine/normal.png",
  "character/heroine/smile.png",
  "character/heroine/sad.png",
  "character/heroine/surprised.png",
  "audio/bgm/showcase_theme.mp3",
  "audio/bgm/memory_theme.mp3",
  "audio/sound/click.ogg",
  "audio/sound/page.ogg",
  "audio/sound/flash.ogg",
  "audio/voice/heroine_001.wav",
  "prop/old_letter.jpg",
  "prop/cassette_tape.jpg",
];

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(sourcePath, targetPath);
    }
  }
}

function assertRequiredFiles() {
  const missing = requiredFiles.filter((relativePath) => !existsSync(path.join(sourceAssetsDir, relativePath)));
  if (missing.length > 0) {
    throw new Error(`Showcase assets are incomplete:\n${missing.map((file) => `- ${file}`).join("\n")}`);
  }
}

async function main() {
  assertRequiredFiles();
  await copyDirectory(sourceAssetsDir, publicAssetsDir);
  console.log("Showcase assets synced to apps/player/public/showcase-assets.");
  console.log("Real assets currently used: Potat0Master backgrounds, Xiael character sprite parts, OpenGameArt BGM, Kenney UI audio, Wikimedia Commons prop photos.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
