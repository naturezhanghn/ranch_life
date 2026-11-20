import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function requireCheck(condition, message) {
  if (!condition) failures.push(message);
}

function requireFile(file) {
  requireCheck(fs.existsSync(path.join(root, file)), `缺少发布文件 ${file}`);
}

const html = read("index.html");
const packageJson = JSON.parse(read("package.json"));
const manifest = JSON.parse(read("manifest.webmanifest"));
const assetManifest = JSON.parse(read("assets/manifest.json"));

requireCheck(/^<!doctype html>/i.test(html), "index.html 缺少标准 doctype");
requireCheck(/<html[^>]+lang="zh-CN"/i.test(html), "index.html 缺少中文 lang 属性");
requireCheck(/name="viewport"[^>]+content="[^"]*width=device-width/i.test(html), "缺少移动端 viewport");
requireCheck(/rel="manifest"[^>]+href="\.\/manifest\.webmanifest"/i.test(html), "缺少 PWA manifest 引用");
requireCheck(/rel="icon"[^>]+href="\.\/favicon\.svg"/i.test(html), "缺少 favicon 引用");
requireCheck(/id="gameCanvas"/.test(html), "缺少主游戏 Canvas");
requireCheck(/id="touchControls"/.test(html) && /id="touchAction"/.test(html), "缺少触屏操作入口");
requireCheck(/id="welcomeOverlay"/.test(html) && /id="newGameButton"/.test(html), "缺少首屏开始入口");
requireCheck(/id="bootStatus"/.test(html), "缺少首屏加载状态");
requireCheck(/id="runtimeError"/.test(html) && /id="runtimeErrorReload"/.test(html), "缺少运行时恢复入口");
requireCheck(/<noscript>/.test(html), "缺少 JavaScript 不可用时的提示");

requireCheck(typeof manifest.name === "string" && manifest.name.length > 0, "manifest 缺少 name");
requireCheck(typeof manifest.start_url === "string" && manifest.start_url.length > 0, "manifest 缺少 start_url");
requireCheck(manifest.display === "standalone", "manifest display 必须支持独立窗口");
requireCheck(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest 缺少图标");
for (const icon of manifest.icons || []) requireFile(icon.src.replace(/^\.\//, ""));

for (const entry of assetManifest.entries || []) requireFile(entry.path);

const requiredScripts = ["build", "check", "check:assets", "test", "story-paths", "balance", "release-check"];
for (const script of requiredScripts) {
  requireCheck(typeof packageJson.scripts?.[script] === "string", `package.json 缺少 npm run ${script}`);
}

const runtimeDir = path.join(root, "js");
for (const filename of fs.readdirSync(runtimeDir).filter((name) => name.endsWith(".js"))) {
  const file = path.join(runtimeDir, filename);
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(`运行时代码语法检查失败 ${path.relative(root, file)}\n${result.stderr.trim()}`);
  }
}

if (failures.length) {
  console.error("Release check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Release check passed: entry, mobile controls, recovery UI, manifest, assets, scripts and runtime syntax are ready.");
}
