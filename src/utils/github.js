const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const USER = 'xbl1e';

let cachedContributions = null;
let cachedRepos = null;

const headers = {
  'Authorization': `token ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json'
};

export async function getGitHubContributions() {
  if (cachedContributions) return cachedContributions;

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalPullRequestContributions
          pullRequestContributions(first: 100) {
            nodes {
              pullRequest {
                createdAt
              }
            }
          }
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                count: contributionCount
                level: contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Authorization': `bearer ${TOKEN}` },
      body: JSON.stringify({ query, variables: { username: USER } })
    });
    const { data } = await res.json();
    const coll = data.user.contributionsCollection;
    const calendar = coll.contributionCalendar;

    const levelMap = { 'NONE': 0, 'FIRST_QUARTILE': 1, 'SECOND_QUARTILE': 2, 'THIRD_QUARTILE': 3, 'FOURTH_QUARTILE': 4 };

    const contributions = calendar.weeks.flatMap(w => w.contributionDays.map(d => ({
      date: d.date,
      count: d.count,
      level: levelMap[d.level] || 0
    })));

    const prs = coll.pullRequestContributions.nodes.map(n => n.pullRequest.createdAt);

    cachedContributions = {
      contributions,
      prs,
      total: {
        lastYear: calendar.totalContributions,
        prs: coll.totalPullRequestContributions
      }
    };
    return cachedContributions;
  } catch (err) {
    return { contributions: [], prs: [], total: { lastYear: 37, prs: 1 } };
  }
}

export async function getGitHubRepos() {
  if (cachedRepos) return cachedRepos;
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?type=public&sort=updated&per_page=100`, { headers });
    const data = await res.json();
    const repos = Array.isArray(data) ? data : [];

    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 15);

    const detailedRepos = await Promise.all(
      topRepos.map(async (repo) => {
        try {
          const detailRes = await fetch(repo.url, { headers });
          return await detailRes.json();
        } catch (e) { return repo; }
      })
    );

    const detailedIds = new Set(detailedRepos.map(r => r.id));
    cachedRepos = [...detailedRepos, ...repos.filter(r => !detailedIds.has(r.id))];

    return cachedRepos;
  } catch (err) {
    return [];
  }
}

export async function getGitHubLangBreakdown() {
  const repos = await getGitHubRepos();
  const langBytes = {};

  const fetches = repos.slice(0, 20).map(async (repo) => {
    try {
      const res = await fetch(repo.languages_url, { headers });
      const langs = await res.json();

      Object.entries(langs).forEach(([lang, bytes]) => {
        langBytes[lang] = (langBytes[lang] || 0) + bytes;
      });
    } catch (e) { }
  });

  await Promise.all(fetches);

  const totalBytes = Object.values(langBytes).reduce((s, b) => s + b, 0);
  const totals = {};

  if (totalBytes > 0) {
    Object.entries(langBytes).forEach(([lang, bytes]) => {
      totals[lang] = bytes / totalBytes;
    });
  }

  return totals;
}

export async function getGlobalStats() {
  const contributions = await getGitHubContributions();
  const repos = await getGitHubRepos();

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalRepos = repos.length;
  const totalCommits = contributions.total?.lastYear || 0;
  const totalPRs = contributions.total?.prs || 0;

  const monthly = {};
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const key = `${d.getFullYear()}-${String(m).padStart(2, '0')}`;
    monthly[key] = { commits: 0, repos: 0, prs: 0, stars: 0 };
  }

  contributions.contributions.forEach(day => {
    const key = day.date.substring(0, 7);
    if (monthly[key]) {
      monthly[key].commits += day.count;
    }
  });

  contributions.prs.forEach(prDate => {
    const key = prDate.substring(0, 7);
    if (monthly[key]) {
      monthly[key].prs += 1;
    }
  });

  repos.forEach(repo => {
    const createdKey = repo.created_at.substring(0, 7);
    if (monthly[createdKey]) {
      monthly[createdKey].repos += 1;
      monthly[createdKey].stars += repo.stargazers_count;
    }
  });

  return {
    stars: totalStars,
    repos: totalRepos,
    commits: totalCommits,
    prs: totalPRs,
    monthly
  };
}
