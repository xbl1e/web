import { PALETTE } from '../../utils/colors.js';
import { getGitHubContributions, getGlobalStats } from '../../utils/github.js';

export async function initStatsCanvas() {
  const canvas = document.getElementById('stats-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = 120 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = parent.clientWidth + 'px';
    canvas.style.height = '120px';
  }

  resize();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let monthlyData = [];
  let labels = [];

  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    labels.push(monthNames[m]);
    monthlyData.push({ key, month: m, year: y, count: 0 });
  }

  const resData = await getGitHubContributions();
  const contributions = Array.isArray(resData.contributions) ? resData.contributions : [];

  if (contributions.length) {
    contributions.forEach(day => {
      if (day.count > 0) {
        const dayKey = day.date.substring(0, 7);
        const entry = monthlyData.find(e => e.key === dayKey);
        if (entry) entry.count += day.count;
      }
    });
  }

  const globalStats = await getGlobalStats();

  const dataValues = monthlyData.map(d => d.count);
  const maxCommits = Math.max(...dataValues, 1);
  let selectedIndex = 11;

  const statLabel = document.getElementById('stat-month-active');
  const commitStat = document.getElementById('stat-commits');
  const prStat = document.getElementById('stat-prs');
  const repoStat = document.getElementById('stat-repos');
  const starStat = document.getElementById('stat-stars');

  function updateUI(index) {
    if (index === -1) {
      statLabel.textContent = '';
      commitStat.textContent = globalStats.commits;
      prStat.textContent = globalStats.prs;
      repoStat.textContent = globalStats.repos;
      starStat.textContent = globalStats.stars;
      return;
    }
    const mData = monthlyData[index];
    const yearShort = String(mData.year).slice(-2);
    const hData = globalStats.monthly[mData.key] || { commits: 0, prs: 0, repos: 0, stars: 0 };

    statLabel.textContent = `| ${labels[index].toUpperCase()} - ${yearShort}`;
    commitStat.textContent = hData.commits;
    prStat.textContent = hData.prs;
    repoStat.textContent = hData.repos;
    starStat.textContent = hData.stars;
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = 120;
    ctx.clearRect(0, 0, w, h);

    const barW = (w - 40) / 12;
    const maxH = h - 20;

    labels.forEach((month, i) => {
      const x = 20 + i * barW;
      const rawH = (dataValues[i] / maxCommits) * maxH;
      const barH = dataValues[i] > 0 ? Math.max(4, rawH) : 2;
      const y = h - 15 - barH;

      let color = 'rgba(255,255,255,0.15)';
      if (i === selectedIndex) color = PALETTE.accent;
      else if (i === labels.length - 1) color = 'rgba(255,255,255,0.4)';

      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y, barW - 4, barH);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = i === selectedIndex ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(month, x + barW / 2, h - 2);
    });
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const barW = (canvas.clientWidth - 40) / 12;
    const index = Math.floor(x / barW);

    if (index >= 0 && index < 12) {
      selectedIndex = index;
      updateUI(index);
      draw();
    }
  });

  window.addEventListener('resize', () => { resize(); draw(); });
  draw();
  updateUI(selectedIndex);
}
