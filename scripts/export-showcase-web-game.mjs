import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playerDistDir = path.join(rootDir, "apps/player/dist");
const showcaseDir = path.join(rootDir, "examples/showcase-game");
const showcasePublicAssetsDir = path.join(rootDir, "apps/player/public/showcase-assets");
const outputDir = path.join(rootDir, "dist/export/showcase-web-game");
const gameDir = path.join(outputDir, "game");

function normalizeExportPath(sourcePath) {
  const trimmed = String(sourcePath ?? "").trim();
  if (!trimmed) return { ok: false, exportPath: "", reason: "empty asset path" };
  if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith("\\\\")) return { ok: false, exportPath: "", reason: "absolute path is not allowed" };
  if (/^https?:\/\//i.test(trimmed)) return { ok: false, exportPath: "", reason: "external URL is not allowed" };
  if (trimmed.startsWith("/showcase-assets/")) return { ok: true, exportPath: trimmed.slice(1).replace(/\\/g, "/") };
  if (trimmed.startsWith("/demo-assets/")) return { ok: true, exportPath: trimmed.slice(1).replace(/\\/g, "/") };
  const normalized = trimmed.replace(/\\/g, "/");
  if (normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) return { ok: false, exportPath: "", reason: "parent directory escape is not allowed" };
  return { ok: true, exportPath: normalized.startsWith("./") ? normalized.slice(2) : normalized };
}

function collectAssetRefs(project) {
  return project.assets.items.map((asset) => {
    const normalized = normalizeExportPath(asset.path);
    return {
      assetId: asset.id,
      assetType: asset.type,
      sourcePath: asset.path,
      exportPath: normalized.exportPath,
      existsInDemoPublic: false
    };
  });
}

function validateProjectForExport(project) {
  const errors = [];
  const warnings = [];
  if (!project.id) errors.push("project id is empty");
  if (!project.scripts.some((script) => script.id === project.startScriptId)) errors.push("startScriptId does not exist");
  for (const asset of project.assets.items) {
    const normalized = normalizeExportPath(asset.path);
    if (!normalized.ok) errors.push(`asset ${asset.id} cannot be exported: ${normalized.reason}`);
    else if (!normalized.exportPath.startsWith("showcase-assets/")) warnings.push(`asset ${asset.id} uses non-showcase path: ${normalized.exportPath}`);
  }
  return { valid: errors.length === 0, errors, warnings };
}

function makeProjectBundle(project) {
  return {
    format: "vn-engine-project",
    formatVersion: "0.1.0",
    exportedAt: new Date().toISOString(),
    project
  };
}

function makeManifest(project, warnings) {
  return {
    exportFormat: "vn-engine-web-export",
    exportVersion: "0.1.0",
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    projectBundlePath: "game/project.bundle.json",
    assetRefs: collectAssetRefs(project),
    warnings
  };
}

async function main() {
  if (!existsSync(playerDistDir)) throw new Error("apps/player/dist is missing. Run pnpm build first.");
  if (!existsSync(showcasePublicAssetsDir)) throw new Error("showcase public assets are missing. Run pnpm prepare:showcase-assets first.");

  const project = JSON.parse(await readFile(path.join(showcaseDir, "project.vnproj.json"), "utf8"));
  const script = JSON.parse(await readFile(path.join(showcaseDir, "scripts/start.vn.json"), "utf8"));
  const fullProject = { ...project, scripts: [script] };
  const validation = validateProjectForExport(fullProject);
  if (!validation.valid) throw new Error(`showcase export validation failed:\n${validation.errors.join("\n")}`);

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(playerDistDir, outputDir, { recursive: true });
  await mkdir(gameDir, { recursive: true });
  await cp(showcasePublicAssetsDir, path.join(outputDir, "showcase-assets"), { recursive: true });
  await cp(path.join(showcaseDir, "CREDITS.md"), path.join(gameDir, "CREDITS.md"));

  await writeFile(path.join(gameDir, "project.bundle.json"), JSON.stringify(makeProjectBundle(fullProject), null, 2), "utf8");
  await writeFile(path.join(gameDir, "export-manifest.json"), JSON.stringify(makeManifest(fullProject, validation.warnings), null, 2), "utf8");
  await writeFile(path.join(gameDir, "README.md"), [
    "# Showcase Web Game",
    "",
    "Run this directory with a static server. Do not open index.html directly.",
    "",
    "```bash",
    "npx serve dist/export/showcase-web-game",
    "```"
  ].join("\n"), "utf8");

  console.log(`Exported showcase web game to ${outputDir}`);
  console.log("Run with: npx serve dist/export/showcase-web-game");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
