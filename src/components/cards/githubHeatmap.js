import { PALETTE } from '../../utils/colors.js';
import { getGitHubContributions } from '../../utils/github.js';

export async function initGitHubGlobe() {
  const canvas = document.getElementById('github-globe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = parent.clientWidth + 'px';
    canvas.style.height = parent.clientHeight + 'px';
  }
  
  resize();

  const WEEKS = 52;
  const DAYS = 7;
  const COLORS = [
    PALETTE.github.level0,
    PALETTE.github.level1,
    PALETTE.github.level2,
    PALETTE.github.level3,
    PALETTE.github.level4,
  ];

  let currentData = [];
  const { contributions } = await getGitHubContributions();

  if (contributions && contributions.length) {
    const last364 = contributions.slice(-364);
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const index = w * 7 + d;
        week.push(last364[index]?.level || 0);
      }
      currentData.push(week);
    }
  } else {
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const rand = Math.random();
        week.push(rand < 0.75 ? 0 : Math.floor(rand * 4) + 1);
      }
      currentData.push(week);
    }
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function draw(data) {
    if (!data.length) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const gap = 3;
    const labelHeight = 18;
    const hPadding = 10;

    const availW = w - (hPadding * 2);
    const availH = h - labelHeight;

    const cellSizeW = (availW - (WEEKS - 1) * gap) / WEEKS;
    const cellSizeH = (availH - (DAYS - 1) * gap) / DAYS;
    const cellSize = Math.floor(Math.min(cellSizeW, cellSizeH));

    const gridTotalW = WEEKS * cellSize + (WEEKS - 1) * gap;
    const gridTotalH = DAYS * cellSize + (DAYS - 1) * gap;

    const offsetX = Math.floor((w - gridTotalW) / 2);
    const offsetY = labelHeight;

    ctx.font = `600 10px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';

    let lastLabelWeek = -10;
    for (let week = 0; week < WEEKS; week++) {
      const dayIndex = week * 7;
      if (contributions && contributions.length >= 364) {
        const dayData = contributions[contributions.length - 364 + dayIndex];
        if (dayData) {
          const date = new Date(dayData.date);
          if (date.getDate() <= 7 && (week - lastLabelWeek) >= 4) {
            const labelX = offsetX + week * (cellSize + gap);
            ctx.fillText(monthNames[date.getMonth()], labelX, 10);
            lastLabelWeek = week;
          }
        }
      }
    }

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < DAYS; day++) {
        const x = offsetX + week * (cellSize + gap);
        const y = offsetY + day * (cellSize + gap);
        const level = data[week][day];

        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 1);
        ctx.fillStyle = COLORS[level];
        ctx.fill();
      }
    }
  }
  
  window.addEventListener('resize', () => { resize(); draw(currentData); });
  draw(currentData);
}
