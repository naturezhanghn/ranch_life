import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const manifestPath = path.join(root, "assets", "manifest.json");
const required = [
  "id",
  "path",
  "scene",
  "kind",
  "source",
  "license",
  "width",
  "height",
  "size",
  "version",
  "maxBytes",
  "fallback",
];

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!Array.isArray(manifest.entries) || !manifest.entries.length) {
  throw new Error("assets/manifest.json has no entries");
}

const ids = new Set();
for (const entry of manifest.entries) {
  for (const field of required) {
    if (entry[field] === undefined || entry[field] === null || entry[field] === "") {
      throw new Error(`asset ${entry.id || "<unknown>"} is missing ${field}`);
    }
  }
  if (ids.has(entry.id)) throw new Error(`duplicate asset id: ${entry.id}`);
  ids.add(entry.id);
  const filePath = path.join(root, entry.path);
  if (!fs.existsSync(filePath)) {
    throw new Error(`asset ${entry.id} is missing file ${entry.path}`);
  }
  const actualSize = fs.statSync(filePath).size;
  if (actualSize > entry.maxBytes) {
    throw new Error(`asset ${entry.id} is ${actualSize} bytes, over max ${entry.maxBytes}`);
  }
  if (Number(entry.size) !== actualSize) {
    throw new Error(`asset ${entry.id} manifest size ${entry.size} does not match actual ${actualSize}`);
  }
  if (!String(entry.scene).split(",").every(Boolean)) {
    throw new Error(`asset ${entry.id} has an empty scene id`);
  }
  if (!String(entry.fallback).trim()) {
    throw new Error(`asset ${entry.id} has no runtime fallback`);
  }
}

console.log(`Asset manifest OK: ${manifest.entries.length} entries, all files present and within size limits.`);
