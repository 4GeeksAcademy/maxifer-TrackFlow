import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const publicDirectory = path.join(websiteDirectory, "public");
const publicAssetsDirectory = path.join(publicDirectory, "assets");

await mkdir(publicAssetsDirectory, { recursive: true });

for (const asset of [
  "trackflow-logo.svg",
  "trackflow-hero.png",
  "trackflow-hero.webp",
  "trackflow-hero.avif"
]) {
  await copyFile(
    path.join(websiteDirectory, "assets", asset),
    path.join(publicAssetsDirectory, asset)
  );
}
