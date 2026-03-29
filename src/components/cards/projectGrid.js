import { getGitHubRepos } from '../../utils/github.js';
import { initScrambleText, initCardClipReveal } from '../shared/interactions.js';

export async function initProjectGrid() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const repos = await getGitHubRepos();
  if (!repos || !repos.length) return;

  const colorMap = {
    'Rust': '#dea584',
    'TypeScript': '#4493f8',
    'JavaScript': '#f7df1e',
    'Python': '#3776ab',
    'Astro': '#ff5a03',
    'C++': '#f34b7d'
  };

  const displayRepos = [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.updated_at) - new Date(a.updated_at);
  }).slice(0, 6);

  grid.innerHTML = displayRepos.map(repo => {
    const timeAgo = formatTimeAgo(new Date(repo.updated_at));
    const langColor = colorMap[repo.language] || '#888890';
    const badgeClass = repo.archived ? 'gh-repo-badge gh-repo-archive' : 'gh-repo-badge';

    return `
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="card span-6 reveal-card">
        <div class="card-sheen"></div>
        <div class="card-inner flex-col justify-between">
          <div class="gh-repo-header">
            <div class="gh-repo-icon">
              <i class="ph ph-github-logo"></i>
            </div>
            <div class="gh-repo-meta-full">
              <div class="gh-repo-title-row">
                <span class="gh-repo-title scramble-text">${repo.full_name}</span>
                <span class="${badgeClass}">${repo.archived ? 'Public archive' : 'Public'}</span>
              </div>
            </div>
          </div>
          ${repo.fork && repo.parent ? `
            <div class="gh-repo-fork">
              <i class="ph ph-git-fork"></i> Forked from <span class="gh-fork-link">${repo.parent.full_name}</span>
            </div>
          ` : ''}
          <p class="gh-repo-desc">${repo.description || 'No description provided.'}</p>
          <div class="gh-repo-footer">
            <div class="gh-repo-stats">
              <span class="gh-stat-item">
                <i class="ph ph-star"></i> ${repo.stargazers_count}
              </span>
              ${repo.license ? `
                <span class="gh-stat-item">
                  <i class="ph ph-scales"></i> ${repo.license.spdx_id || repo.license.name}
                </span>
              ` : ''}
              <span class="gh-stat-item">
                <i class="ph ph-git-fork"></i> ${repo.forks_count}
              </span>
            </div>
            ${repo.language ? `
              <div class="gh-repo-lang">
                <span class="gh-lang-color" style="background-color: ${langColor};"></span>
                <span class="gh-lang-name">${repo.language}</span>
              </div>
            ` : ''}
          </div>
          <div class="gh-repo-updated">updated ${timeAgo}</div>
        </div>
      </a>
    `;
  }).join('');

  initScrambleText();
  initCardClipReveal();
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}
