import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";

const root = new URL("../", import.meta.url);
const { repository, revision } = JSON.parse(
  await readFile(new URL("agent-skills.source.json", root), "utf8"),
);
assert(/^[a-f0-9]{40}$/.test(revision), "Pin a complete Git commit SHA");
assert(repository.startsWith("https://"), "Use an HTTPS source repository");
const { values } = parseArgs({ options: { source: { type: "string" } } });
const temporary = await mkdtemp(join(tmpdir(), "sumup-agent-skills-"));
try {
  const source = values.source
    ? resolve(values.source)
    : join(temporary, "repo");
  if (!values.source) {
    execFileSync("git", ["init", "--bare", source]);
    execFileSync("git", [
      "-C",
      source,
      "fetch",
      "--depth=1",
      repository,
      revision,
    ]);
  }
  assert.equal(
    execFileSync("git", ["-C", source, "rev-parse", `${revision}^{commit}`], {
      encoding: "utf8",
    }).trim(),
    revision,
  );
  // Archive the pinned tree, never a source checkout's uncommitted changes.
  const archive = execFileSync(
    "git",
    ["-C", source, "archive", "--format=tar", revision, "skills", "LICENSE"],
    { maxBuffer: 16 * 1024 * 1024 },
  );
  execFileSync("tar", ["-xf", "-", "-C", temporary], { input: archive });
  const snapshot = join(temporary, "skills");
  const names = await readdir(snapshot);
  assert(names.length > 0, "Source contains no skills");
  for (const name of names) {
    const skill = await readFile(join(snapshot, name, "SKILL.md"), "utf8");
    const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert(frontmatter, `${name}: missing metadata`);
    assert.equal(parse(frontmatter[1]).name, name);
  }
  await cp(join(temporary, "LICENSE"), join(snapshot, "LICENSE"));
  const target = new URL("skills/", root);
  await rm(target, { recursive: true, force: true });
  await cp(snapshot, target, { recursive: true });
  console.log(`Synced ${names.length} skills from ${repository}@${revision}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
