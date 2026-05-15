import { createReadStream, existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportDir = path.join(rootDir, "dist/export/showcase-web-game");
const requiredFiles = [
  "index.html",
  "game/project.bundle.json",
  "game/export-manifest.json"
];

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp3", "audio/mpeg"],
  [".ogg", "audio/ogg"],
  [".wav", "audio/wav"]
]);

function fail(message) {
  throw new Error(`[verify-showcase-export] ${message}`);
}

function normalizeRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(new URL(urlPath, "http://127.0.0.1").pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const resolved = path.resolve(exportDir, relativePath);
  const relativeToExport = path.relative(exportDir, resolved);
  if (relativeToExport.startsWith("..") || path.isAbsolute(relativeToExport)) {
    return undefined;
  }
  return resolved;
}

function isDangerousPath(value) {
  const raw = String(value ?? "").trim();
  const normalized = raw.replace(/\\/g, "/");
  return (
    raw.length === 0 ||
    /^[a-zA-Z]:[\\/]/.test(raw) ||
    raw.startsWith("\\\\") ||
    raw.startsWith("file://") ||
    /^https?:\/\//i.test(raw) ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized.startsWith("/Users/") ||
    normalized.startsWith("/home/") ||
    normalized.startsWith("/etc/") ||
    normalized.startsWith("/var/") ||
    normalized.startsWith("/tmp/")
  );
}

function isUnsafeExportPath(value) {
  const raw = String(value ?? "").trim();
  const normalized = raw.replace(/\\/g, "/");
  return (
    isDangerousPath(raw) ||
    normalized.startsWith("/") ||
    /^https?:\/\//i.test(raw)
  );
}

async function assertExists(relativePath) {
  const target = path.join(exportDir, relativePath);
  if (!existsSync(target)) {
    fail(`missing ${relativePath}`);
  }
  return target;
}

async function assertDirectoryHasFiles(relativePath) {
  const target = await assertExists(relativePath);
  const info = await stat(target);
  if (!info.isDirectory()) {
    fail(`${relativePath} is not a directory`);
  }
  const files = await readdir(target);
  if (files.length === 0) {
    fail(`${relativePath} is empty`);
  }
}

function createStaticServer() {
  return http.createServer(async (request, response) => {
    try {
      const filePath = normalizeRequestPath(request.url ?? "/");
      if (!filePath || !existsSync(filePath)) {
        response.writeHead(404);
        response.end("not found");
        return;
      }
      const info = await stat(filePath);
      if (!info.isFile()) {
        response.writeHead(404);
        response.end("not found");
        return;
      }
      response.writeHead(200, {
        "content-type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream"
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500);
      response.end(String(error instanceof Error ? error.message : error));
    }
  });
}

async function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("static server did not expose a TCP port"));
        return;
      }
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

async function fetchOk(baseUrl, relativePath) {
  const response = await fetch(`${baseUrl}/${relativePath.replace(/^\/+/, "")}`);
  if (!response.ok) {
    fail(`HTTP ${response.status} for ${relativePath}`);
  }
  return response;
}

function selectAssetSamples(assetRefs) {
  const requiredTypes = ["background", "character", "prop", "bgm", "sound", "voice"];
  const samples = [];
  for (const type of requiredTypes) {
    const item = assetRefs.find((asset) => asset.assetType === type);
    if (!item) {
      fail(`manifest has no ${type} asset`);
    }
    samples.push(item);
  }
  for (const assetId of ["prop-old-letter", "prop-cassette-tape"]) {
    const item = assetRefs.find((asset) => asset.assetId === assetId);
    if (!item) {
      fail(`manifest missing required prop asset ${assetId}`);
    }
    if (!samples.some((asset) => asset.assetId === item.assetId)) {
      samples.push(item);
    }
  }
  return samples;
}

async function main() {
  if (!existsSync(exportDir)) {
    fail("dist/export/showcase-web-game does not exist. Run pnpm export:showcase-web first.");
  }
  for (const file of requiredFiles) {
    await assertExists(file);
  }
  await assertDirectoryHasFiles("assets");

  const manifest = JSON.parse(await readFile(path.join(exportDir, "game/export-manifest.json"), "utf8"));
  if (!Array.isArray(manifest.assetRefs)) {
    fail("export manifest assetRefs is not an array");
  }
  if (manifest.projectId !== "showcase-game") {
    fail(`unexpected projectId ${manifest.projectId}`);
  }

  for (const asset of manifest.assetRefs) {
    if (isUnsafeExportPath(asset.exportPath)) {
      fail(`unsafe exportPath for ${asset.assetId}: ${asset.exportPath}`);
    }
    if (isDangerousPath(asset.sourcePath)) {
      fail(`unsafe sourcePath for ${asset.assetId}: ${asset.sourcePath}`);
    }
    await assertExists(asset.exportPath);
  }

  const server = createStaticServer();
  const baseUrl = await listen(server);
  try {
    await fetchOk(baseUrl, "index.html");
    const bundle = await fetchOk(baseUrl, "game/project.bundle.json");
    JSON.parse(await bundle.text());
    const manifestResponse = await fetchOk(baseUrl, "game/export-manifest.json");
    JSON.parse(await manifestResponse.text());

    for (const asset of selectAssetSamples(manifest.assetRefs)) {
      await fetchOk(baseUrl, asset.exportPath);
    }
  } finally {
    await closeServer(server);
  }

  console.log("Showcase export verification passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
