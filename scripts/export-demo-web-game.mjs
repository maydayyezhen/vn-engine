import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playerDistDir = path.join(rootDir, "apps/player/dist");
const demoAssetsDir = path.join(rootDir, "apps/player/public/demo-assets");
const outputDir = path.join(rootDir, "dist/export/demo-web-game");
const gameDir = path.join(outputDir, "game");

function normalizeExportPath(sourcePath) {
  const trimmed = sourcePath.trim();
  if (!trimmed) return { ok: false, exportPath: "", reason: "素材路径为空。" };
  if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith("\\\\")) return { ok: false, exportPath: "", reason: "不支持绝对路径。" };
  if (/^https?:\/\//i.test(trimmed)) return { ok: false, exportPath: "", reason: "不支持外部URL素材。" };
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("/demo-assets/")) return { ok: true, exportPath: trimmed.slice(1).replace(/\\/g, "/") };
    return { ok: false, exportPath: "", reason: "不支持非demo-assets根路径。" };
  }
  const normalized = trimmed.replace(/\\/g, "/");
  if (normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) return { ok: false, exportPath: "", reason: "不支持上级目录引用。" };
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
      existsInDemoPublic: normalized.ok && normalized.exportPath.startsWith("demo-assets/")
    };
  });
}

function validateProjectForExport(project) {
  const errors = [];
  const warnings = [];
  if (!project.id) errors.push("项目id不能为空。");
  if (!project.scripts.some((script) => script.id === project.startScriptId)) errors.push("startScriptId不存在。");
  for (const asset of project.assets.items) {
    const normalized = normalizeExportPath(asset.path);
    if (!asset.path.trim()) errors.push(`素材 ${asset.id} 的路径为空。`);
    else if (!normalized.ok) errors.push(`素材 ${asset.id} 的路径不能导出：${normalized.reason}`);
    else if (!normalized.exportPath.startsWith("demo-assets/")) warnings.push(`素材 ${asset.id} 使用非demo路径：${normalized.exportPath}`);
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

function crc32(buffer) {
  const table = crc32.table ?? (crc32.table = Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  }));
  let crc = 0xffffffff;
  for (const byte of buffer) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPlaceholderPng(width, height, color) {
  const rawRows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      row[offset] = color[0];
      row[offset + 1] = color[1];
      row[offset + 2] = color[2];
      row[offset + 3] = color[3];
    }
    rawRows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = zlib.deflateSync(Buffer.concat(rawRows));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

async function ensurePlaceholderImages(targetRoot) {
  const files = [
    ["demo-assets/background/classroom.png", [44, 71, 100, 255]],
    ["demo-assets/background/corridor.png", [70, 82, 92, 255]],
    ["demo-assets/character/lincheng/normal.png", [100, 122, 142, 230]],
    ["demo-assets/character/lincheng/smile.png", [118, 138, 158, 230]]
  ];
  for (const [relativePath, color] of files) {
    const filePath = path.join(targetRoot, relativePath);
    if (existsSync(filePath)) continue;
    await mkdir(path.dirname(filePath), { recursive: true });
    const isBackground = relativePath.includes("/background/");
    await writeFile(filePath, createPlaceholderPng(isBackground ? 1280 : 420, isBackground ? 720 : 720, color));
  }
}

async function main() {
  if (!existsSync(playerDistDir)) {
    throw new Error("apps/player/dist 不存在，请先执行 pnpm build。");
  }
  if (!existsSync(demoAssetsDir)) {
    throw new Error("apps/player/public/demo-assets 不存在，请先执行 pnpm generate:demo-audio。");
  }

  const project = JSON.parse(await readFile(path.join(rootDir, "examples/demo-game/project.vnproj.json"), "utf8"));
  const script = JSON.parse(await readFile(path.join(rootDir, "examples/demo-game/scripts/start.vn.json"), "utf8"));
  const fullProject = { ...project, scripts: [script] };
  const validation = validateProjectForExport(fullProject);
  if (!validation.valid) {
    throw new Error(`导出校验失败：\n${validation.errors.join("\n")}`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(playerDistDir, outputDir, { recursive: true });
  await mkdir(gameDir, { recursive: true });
  await cp(demoAssetsDir, path.join(outputDir, "demo-assets"), { recursive: true });
  await ensurePlaceholderImages(outputDir);

  await writeFile(path.join(gameDir, "project.bundle.json"), JSON.stringify(makeProjectBundle(fullProject), null, 2), "utf8");
  await writeFile(path.join(gameDir, "export-manifest.json"), JSON.stringify(makeManifest(fullProject, validation.warnings), null, 2), "utf8");
  await writeFile(path.join(gameDir, "README.md"), [
    "# 导出的 Web 游戏包",
    "",
    "请用静态服务器运行导出目录，不建议直接双击 index.html。",
    "",
    "示例：",
    "",
    "```bash",
    "npx serve dist/export/demo-web-game",
    "```",
    "",
    `校验指纹：${createHash("sha256").update(JSON.stringify(fullProject)).digest("hex").slice(0, 16)}`
  ].join("\n"), "utf8");

  console.log(`Exported demo web game to ${outputDir}`);
  console.log("Run with: npx serve dist/export/demo-web-game");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
