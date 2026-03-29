import { getGitHubLangBreakdown } from '../../utils/github.js';

export async function initLangCanvas() {
  const canvas = document.getElementById('lang-canvas');
  const langList = document.getElementById('lang-list');
  if (!canvas || !langList) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = 100 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = parent.clientWidth + 'px';
    canvas.style.height = '100px';
  }

  resize();

  const colorMap = {
    'Rust': '#dea584',
    'TypeScript': '#4493f8',
    'JavaScript': '#f7df1e',
    'Python': '#3776ab',
    'Astro': '#ff5d01',
    'C++': '#f34b7d',
    'Go': '#00add8',
    'HTML': '#e34c26',
    'CSS': '#563d7c'
  };

  let languages = [];
  const langData = await getGitHubLangBreakdown();
  const entries = Object.entries(langData);

  if (entries.length) {
    const totalFraction = entries.reduce((s, e) => s + e[1], 0);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const top4 = sorted.slice(0, 4);
    const othersFraction = sorted.slice(4).reduce((sum, curr) => sum + curr[1], 0);

    languages = top4.map(([name, fraction]) => ({
      name,
      percent: Math.round((fraction / totalFraction) * 100),
      color: colorMap[name] || '#888890'
    }));

    if (othersFraction > 0) {
      languages.push({
        name: 'Other',
        percent: Math.round((othersFraction / totalFraction) * 100),
        color: '#333336'
      });
    }

    languages = languages.filter(l => l.percent > 0);
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = 100;
    ctx.clearRect(0, 0, w, h);

    const outerRadius = 40;
    const innerRadius = 25;
    const centerX = w / 2;
    const centerY = h / 2;

    let totalPercent = languages.reduce((sum, l) => sum + l.percent, 0);
    let currentAngle = -Math.PI / 2;

    languages.forEach(lang => {
      const sliceAngle = (lang.percent / totalPercent) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = lang.color;
      ctx.fill();
      currentAngle += sliceAngle;
    });

    langList.innerHTML = languages.map(lang => `
      <div class="lang-item reveal-item">
        <div class="lang-label">
          <div class="lang-dot" style="background-color: ${lang.color}"></div>
          <span class="lang-name">${lang.name}</span>
        </div>
        <div class="lang-track">
          <div class="lang-progress" style="width: ${lang.percent}%; background-color: ${lang.color}"></div>
        </div>
        <span class="lang-percent">${lang.percent}%</span>
      </div>
    `).join('');
  }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); draw(); });
}
