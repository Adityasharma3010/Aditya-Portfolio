import { readFileSync } from "node:fs";
import { join } from "node:path";
import { json } from "./_lib.js";

/*
  GET /api/github  ->  { updatedAt, source, total, days: { "YYYY-MM-DD": count }, recent: [{ repo, message, url, date }] }

  - activity strip : every commit you made across your recent repos (or GitHub's own calendar when a token is set)
  - recent commits : ONLY the repos listed in src/data/repos.json, i.e. the projects shown on the site

  Fetched on the server so a token never reaches the browser and GitHub is only hit when the CDN cache
  expires (30 min).

  Env (all optional):
    GITHUB_USERNAME   default "Adityasharma3010"
    GITHUB_REPOS      optional override for the project repo list, comma separated "owner/name"
    GITHUB_TOKEN      raises the rate limit from 60/h and unlocks the exact contribution calendar (incl. private work)
*/
const WEEKS = 26;

// the repos behind the Projects section. Kept in sync automatically because it reads the same file the site uses.
const FALLBACK_REPOS = [
  "Adityasharma3010/game-deal-alerts", "Adityasharma3010/ordly", "Adityasharma3010/Clam-Generator",
  "Adityasharma3010/FreeGamesTracker", "Adityasharma3010/Binkeyit", "Adityasharma3010/bookStoreApp",
  "Adityasharma3010/Games-Listing", "Adityasharma3010/React-WeatherApp", "Adityasharma3010/Tailwind-css-vpn",
];
const projectRepos = () => {
  if (process.env.GITHUB_REPOS) return process.env.GITHUB_REPOS.split(",").map((r) => r.trim()).filter(Boolean);
  try {
    const file = JSON.parse(readFileSync(join(process.cwd(), "src/data/repos.json"), "utf8"));
    const list = Object.values(file).map((v) => v.repo).filter(Boolean);
    if (list.length) return list;
  } catch { /* fall through */ }
  return FALLBACK_REPOS;
};
const day = (iso) => iso.slice(0, 10);

export default async function handler(req, res) {
  const user = process.env.GITHUB_USERNAME || "Adityasharma3010";
  const token = process.env.GITHUB_TOKEN;
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-activity", ...(token && { Authorization: `Bearer ${token}` }) };
  const get = async (url) => {
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  };

  try {
    const since = new Date(Date.now() - WEEKS * 7 * 86400000).toISOString();
    const repos = (await get(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=12&type=owner`)).filter((r) => !r.fork);

    const lists = await Promise.all(
      repos.map((r) =>
        get(`https://api.github.com/repos/${r.full_name}/commits?author=${user}&since=${since}&per_page=100`)
          .then((cs) => cs.map((c) => ({ repo: r.name, message: c.commit.message.split("\n")[0], url: c.html_url, date: c.commit.author.date })))
          .catch(() => [])
      )
    );
    const commits = lists.flat().sort((a, b) => new Date(b.date) - new Date(a.date));

    // latest commits shown on the site: only the project repos. Reuse what we already fetched, load the rest.
    const have = new Map(repos.map((r, i) => [r.full_name.toLowerCase(), lists[i]]));
    const mine = projectRepos();
    const projectLists = await Promise.all(
      mine.map((full) =>
        have.has(full.toLowerCase())
          ? have.get(full.toLowerCase())
          : get(`https://api.github.com/repos/${full}/commits?author=${user}&per_page=8`)
              .then((cs) => cs.map((c) => ({ repo: full.split("/")[1], message: c.commit.message.split("\n")[0], url: c.html_url, date: c.commit.author.date })))
              .catch(() => [])
      )
    );
    const recent = projectLists.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    let days = {};
    let source = "commits";
    let total = commits.length;
    for (const c of commits) days[day(c.date)] = (days[day(c.date)] || 0) + 1;

    // with a token, use GitHub's own contribution calendar (exact, includes private repos)
    if (token) {
      try {
        const q = { query: `query($u:String!,$from:DateTime!){user(login:$u){contributionsCollection(from:$from){contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`, variables: { u: user, from: since } };
        const r = await fetch("https://api.github.com/graphql", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(q) });
        const cal = (await r.json())?.data?.user?.contributionsCollection?.contributionCalendar;
        if (cal) {
          days = {};
          cal.weeks.forEach((w) => w.contributionDays.forEach((d) => (days[d.date] = d.contributionCount)));
          total = cal.totalContributions;
          source = "graphql";
        }
      } catch { /* keep the commit based numbers */ }
    }

    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
    return json(res, 200, { updatedAt: new Date().toISOString(), source, total, days, recent });
  } catch (err) {
    console.error("github:", err.message);
    return json(res, 502, { error: "GitHub is not reachable right now" });
  }
}
