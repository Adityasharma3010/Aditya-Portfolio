// Pulls real data (created date, last push, stars, languages) from GitHub into src/data/github.json
// Run:  npm run sync:github
// Private repos / rate limits: set a token first (macOS/Linux: GITHUB_TOKEN=xxx npm run sync:github,
// Windows PowerShell: $env:GITHUB_TOKEN="xxx"; npm run sync:github)
import { readFile, writeFile } from "node:fs/promises";

const repos = JSON.parse(await readFile(new URL("../src/data/repos.json", import.meta.url), "utf8"));
const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-sync" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const get = async (url) => {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

const out = {};
for (const [slug, { repo }] of Object.entries(repos)) {
  try {
    const [info, languages] = await Promise.all([
      get(`https://api.github.com/repos/${repo}`),
      get(`https://api.github.com/repos/${repo}/languages`),
    ]);
    out[slug] = {
      repo,
      createdAt: info.created_at,
      pushedAt: info.pushed_at,
      stars: info.stargazers_count,
      forks: info.forks_count,
      homepage: info.homepage || "",
      topics: info.topics || [],
      languages,
    };
    console.log("ok  ", slug);
  } catch (e) {
    console.log("skip", slug, "-", e.message);
  }
}

await writeFile(new URL("../src/data/github.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log("\nwrote src/data/github.json");
