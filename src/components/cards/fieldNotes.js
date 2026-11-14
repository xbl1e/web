import { getGitHubRepos } from '../../utils/github.js';

const CONTRIBUTIONS_URL = 'https://github-contributions-api.jogruber.de/v4/xbl1e?y=last';
const PRESENCE_URL = 'https://api.lanyard.rest/v1/users/1265980041813164149';
const numberFormat = new Intl.NumberFormat('en');

const presenceLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do not disturb',
  offline: 'Offline',
};

const activityLabels = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching',
  5: 'Competing in',
};

export function initFieldNotes() {
  return Promise.all([showRepositoryStats(), showContributions(), showDiscordPresence()]);
}

async function showRepositoryStats() {
  const repos = document.getElementById('stat-repos');
  const stars = document.getElementById('stat-stars');
  if (!repos || !stars) return;

  try {
    const repositories = await getGitHubRepos();
    const starCount = repositories.reduce((total, repository) => total + repository.stargazers_count, 0);
    if (!Number.isInteger(starCount) || starCount < 0) throw new Error('Invalid repository star count');
    repos.textContent = numberFormat.format(repositories.length);
    stars.textContent = numberFormat.format(starCount);
  } catch {
    markUnavailable(repos);
    markUnavailable(stars);
  }
}

async function showContributions() {
  const stat = document.getElementById('stat-contributions');
  const heatmap = document.getElementById('activity-heatmap');
  if (!stat && !heatmap) return;

  try {
    const { total, contributions } = await fetchJson(CONTRIBUTIONS_URL);
    if (!Number.isInteger(total?.lastYear) || total.lastYear < 0 || !Array.isArray(contributions)) {
      throw new Error('Invalid contribution calendar');
    }

    if (stat) stat.textContent = numberFormat.format(total.lastYear);
    if (heatmap && contributions.length) renderHeatmap(heatmap, contributions, total.lastYear);
  } catch {
    if (stat) markUnavailable(stat);
    if (heatmap) heatmap.hidden = true;
  }
}

function renderHeatmap(heatmap, days, total) {
  const firstWeekDay = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  if (!Number.isInteger(firstWeekDay)) throw new Error('Invalid contribution date');

  const fragment = document.createDocumentFragment();

  for (const [index, { date, count, level }] of days.entries()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(count) || count < 0 ||
        !Number.isInteger(level) || level < 0 || level > 4) {
      throw new Error('Invalid contribution day');
    }

    const calendarIndex = firstWeekDay + index;
    const cell = document.createElement('span');
    cell.className = 'activity-day';
    cell.dataset.level = level;
    cell.style.gridArea = `${(calendarIndex % 7) + 1} / ${Math.floor(calendarIndex / 7) + 1}`;
    cell.title = `${date}: ${count} ${count === 1 ? 'contribution' : 'contributions'}`;
    fragment.append(cell);
  }

  heatmap.style.setProperty('--activity-weeks', Math.ceil((firstWeekDay + days.length) / 7));
  heatmap.replaceChildren(fragment);
  heatmap.setAttribute('role', 'img');
  heatmap.setAttribute('aria-label', `GitHub activity calendar. ${numberFormat.format(total)} contributions in the last year.`);
  heatmap.hidden = false;
}

async function showDiscordPresence() {
  const presence = document.getElementById('discord-status');
  const text = document.getElementById('discord-activity-text');
  if (!presence || !text) return;

  try {
    const { data } = await fetchJson(PRESENCE_URL);
    const status = data?.discord_status;
    if (!Object.hasOwn(presenceLabels, status)) throw new Error('Invalid Discord presence');

    const activity = Array.isArray(data.activities)
      ? data.activities.find(({ type, name }) => Object.hasOwn(activityLabels, type) && name)
      : undefined;

    presence.dataset.status = status;
    text.textContent = status !== 'offline' && activity
      ? `${presenceLabels[status]} · ${activityLabels[activity.type]} ${activity.name}`
      : presenceLabels[status];
  } catch {
    presence.dataset.status = 'unavailable';
    text.textContent = 'Presence unavailable';
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function markUnavailable(stat) {
  stat.textContent = '—';
  stat.title = 'Unavailable';
}
