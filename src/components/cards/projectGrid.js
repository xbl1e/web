import { GITHUB_PROFILE, getGitHubRepos } from '../../utils/github.js';

export async function initProjectGrid() {
  const grid = document.getElementById('projects-grid');
  const status = document.getElementById('archive-status');
  if (!grid || !status) return;

  status.textContent = 'Loading repositories…';

  try {
    const repositories = await getGitHubRepos();

    if (!repositories.length) {
      status.textContent = 'No public repositories';
      return;
    }

    const catalogue = [...repositories].sort((a, b) => Number(Boolean(a.fork)) - Number(Boolean(b.fork)));
    grid.replaceChildren(...catalogue.map(renderRepository));
    status.textContent = `${catalogue.length} ${catalogue.length === 1 ? 'repository' : 'repositories'}`;
  } catch {
    status.textContent = 'GitHub repositories are temporarily unavailable';
  }
}

function renderRepository(repository, index) {
  const row = document.createElement('a');
  row.className = 'archive-row';
  row.href = `${GITHUB_PROFILE}/${encodeURIComponent(repository.name)}`;
  row.target = '_blank';
  row.rel = 'noopener noreferrer';

  const number = makeLabel('archive-number', String(index + 1).padStart(2, '0'));
  number.setAttribute('aria-hidden', 'true');

  const metadata = [repository.language];
  if (repository.fork) metadata.push('Fork');
  if (repository.archived) metadata.push('Archived');

  const arrow = makeLabel('archive-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');

  row.append(
    number,
    makeLabel('archive-name', repository.name),
    makeLabel('archive-summary', repository.description || ''),
    makeLabel('archive-language', metadata.filter(Boolean).join(' · ') || '—'),
    arrow,
  );

  return row;
}

function makeLabel(className, text) {
  const label = document.createElement('span');
  label.className = className;
  label.textContent = text;
  return label;
}
