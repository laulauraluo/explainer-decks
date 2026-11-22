// CI checks: each skill's frontmatter against the Agent Skills spec, manifests, evals, local links, no personal terms.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const errors = [];
const json = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const walk = (d) => readdirSync(d).flatMap((f) => (f === ".git" || f === "node_modules" ? [] : statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

for (const name of readdirSync(join(root, "skills"))) {
  const fm = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8").match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  const field = (k) => fm.match(new RegExp(`^${k}: (.*)$`, "m"))?.[1] ?? "";
  if (field("name") !== name) errors.push(`skills/${name}: name must match the folder`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push(`skills/${name}: bad name`);
  const d = field("description").length;
  if (d < 1 || d > 1024) errors.push(`skills/${name}: description is ${d} chars, must be 1-1024`);
  if (field("compatibility").length > 500) errors.push(`skills/${name}: compatibility over 500 chars`);
}
const plugin = json(".claude-plugin/plugin.json"), ext = json("gemini-extension.json");
if (ext.version !== plugin.version || ext.name !== plugin.name) errors.push("gemini-extension.json must match plugin.json name and version");
for (const e of json("evals/evals.json").evals) if (!e.prompt || !e.expected_output || !e.skill) errors.push(`eval ${e.id} needs skill, prompt and expected_output`);

const files = walk(root);
for (const md of files.filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(md, "utf8");
  const targets = [...text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g), ...text.matchAll(/(?:src|srcset|href)="([^"#]+)"/g)].map((m) => m[1]);
  for (const t of targets) if (!/^[a-z]+:/.test(t) && !t.includes("<") && !existsSync(join(dirname(md), t))) errors.push(`${relative(root, md)}: broken link ${t}`);
}
// The templates started from private decks; keep private names out for good.
const banned = /\b(Laura|Intuit|Salesforce|Fortinet|FlashKA)\b/;
for (const f of files.filter((f) => /\.(md|html|mjs|js|css|json)$/.test(f) && !f.endsWith("check-repo.mjs"))) {
  const m = readFileSync(f, "utf8").match(banned);
  if (m) errors.push(`${relative(root, f)}: contains "${m[0]}"`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("repository checks passed");
