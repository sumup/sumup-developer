import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function listFiles(directory) {
  return (await readdir(directory, { recursive: true, withFileTypes: true }))
    .filter((entry) => !entry.isDirectory())
    .map((entry) => join(entry.parentPath, entry.name));
}
