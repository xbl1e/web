const TAU = Math.PI * 2;
const SECTIONS = 44;
const STEPS = 4;
const FIBRES = 78;
const RINGS = SECTIONS * STEPS + 1;

const PALETTES = [
  [[65, 33, 242], [36, 92, 255], [100, 40, 255], [255, 37, 131], [255, 77, 34], [255, 154, 43], [65, 33, 242]],
  [[28, 58, 218], [37, 136, 255], [109, 217, 255], [221, 39, 246], [255, 67, 158], [100, 59, 255], [28, 58, 218]],
  [[255, 69, 37], [255, 151, 55], [250, 63, 117], [156, 47, 255], [68, 75, 252], [91, 190, 255]],
];

function axisPoint(mode, t) {
  if (mode === 1) {
    const fold = 0.33 * Math.cos(3 * t + 0.5);
    return [
      (1.02 + fold) * Math.cos(t) * 0.92,
      (1.02 + fold) * Math.sin(t) * 0.875,
      0.39 * Math.sin(3 * t + 0.5) + 0.13 * Math.sin(2 * t),
    ];
  }

  if (mode === 2) {
    const along = t / TAU - 0.5;
    return [
      2.55 * along + 0.37 * Math.cos(1.5 * t + 0.2),
      0.66 * Math.sin(1.5 * t + 0.2) + 0.18 * Math.sin(0.8 * t),
      0.57 * Math.cos(1.5 * t),
    ];
  }

  const fold = 0.42 * Math.cos(3 * t + 0.5);
  return [
    (0.87 + fold) * Math.cos(2 * t) * 0.96,
    (0.83 + fold) * Math.sin(2 * t) * 0.82,
    0.44 * Math.sin(3 * t + 0.5),
  ];
}

function buildForm(mode) {
  const points = new Float32Array(RINGS * FIBRES * 3);
  const normals = new Float32Array(points.length);

  for (let ring = 0; ring < RINGS; ring += 1) {
    const fraction = ring / (RINGS - 1);
    const t = fraction * TAU;
    const [x, y, z] = axisPoint(mode, t);
    const prior = axisPoint(mode, t - 0.001);
    const next = axisPoint(mode, t + 0.001);
    const tangent = next.map((value, axis) => value - prior[axis]);
    const length = Math.hypot(...tangent);
    const [tx, ty, tz] = tangent.map(value => value / length);
    const sides = Math.hypot(tx, ty);
    const ux = -ty / sides;
    const uy = tx / sides;
    const vx = -tz * uy;
    const vy = tz * ux;
    const vz = tx * uy - ty * ux;

    const twist = t + 0.63 * Math.sin(mode === 1 ? 3 * t : 2 * t);
    const baseWidth = mode === 0 ? 0.28 : 0.31;
    const taper = mode === 2 ? Math.sin(Math.PI * fraction) ** 0.66 : 1;
    const width = baseWidth * (0.19 + 0.81 * taper) * (1 + 0.19 * Math.sin(3 * t + 0.6));
    const thickness = width * 0.48;

    for (let fibre = 0; fibre < FIBRES; fibre += 1) {
      const angle = fibre / FIBRES * TAU + twist;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const offset = (ring * FIBRES + fibre) * 3;

      points[offset] = x + ux * c * width + vx * s * thickness;
      points[offset + 1] = y + uy * c * width + vy * s * thickness;
      points[offset + 2] = z + vz * s * thickness;

      const unit = Math.hypot(c, s * width / thickness);
      normals[offset] = (ux * c + vx * s * width / thickness) / unit;
      normals[offset + 1] = (uy * c + vy * s * width / thickness) / unit;
      normals[offset + 2] = vz * s * width / thickness / unit;
    }
  }

  const shades = Array.from({ length: SECTIONS }, (_, section) => {
    const palette = PALETTES[mode];
    const position = (section + 0.5) / SECTIONS * (palette.length - 1);
    const index = Math.floor(position);
    const fraction = position - index;
    return palette[index].map((value, channel) => value + (palette[index + 1][channel] - value) * fraction);
  });

  return { points, normals, shades };
}

export function initSignalStudy(canvas, { mode = 0, pause = false } = {}) {
  const context = canvas.getContext('2d');
  if (!context) return { setMode() {}, setPaused() {} };

  const stage = canvas.closest('.hero-stage') ?? canvas;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');
  const forms = new Map();
  const projected = new Float32Array(RINGS * FIBRES * 3);
  const sections = Array.from({ length: SECTIONS }, (_, index) => ({ index, depth: 0 }));
  const nearSide = new Uint8Array(FIBRES);
  const fibreTexture = Float32Array.from({ length: FIBRES }, (_, index) => 0.88 + 0.12 * Math.sin(index * 2.63));
  let activeMode = mode;
  let paused = pause;
  let visible = true;
  let width = 0;
  let height = 0;
  let time = 0;
  let previousFrame = 0;
  let scheduled = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let aura = null;

  function getForm() {
    if (!forms.has(activeMode)) forms.set(activeMode, buildForm(activeMode));
    return forms.get(activeMode);
  }

  function alongScreen(isNarrow) {
    return [width * (isNarrow ? 0.58 : 0.70), height * (isNarrow ? 0.62 : 0.51)];
  }

  function resize() {
    const { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    width = cssWidth;
    height = cssHeight;
    const pixelRatio = Math.min(1.65, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(cssWidth * pixelRatio));
    canvas.height = Math.max(1, Math.round(cssHeight * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const [x, y] = alongScreen(width < 720);
    const radius = Math.max(1, Math.min(width * 0.47, height * 0.79));
    aura = context.createRadialGradient(x, y, 0, x, y, radius);
    aura.addColorStop(0, 'rgba(62, 52, 156, .22)');
    aura.addColorStop(0.48, 'rgba(39, 22, 101, .19)');
    aura.addColorStop(1, 'rgba(26, 15, 70, 0)');
    paint();
    if (width && height) canvas.dataset.signalReady = 'true';
  }

  function paint() {
    if (!width || !height) return;
    const narrow = width < 720;
    const [centerX, centerY] = alongScreen(narrow);
    const scale = narrow
      ? Math.min(width * 0.392, height * 0.45)
      : Math.min(width * 0.267, height * 0.51);
    const yaw = -0.17 + Math.sin(time * 0.41) * 0.18 + pointerX * 0.28;
    const pitch = 0.23 + Math.sin(time * 0.53) * 0.12 + pointerY * 0.23;
    const roll = -0.29 + Math.sin(time * 0.37) * 0.16;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const cosR = Math.cos(roll);
    const sinR = Math.sin(roll);
    const { points, normals, shades } = getForm();

    context.clearRect(0, 0, width, height);
    context.fillStyle = aura;
    context.fillRect(0, 0, width, height);

    for (let offset = 0; offset < points.length; offset += 3) {
      const x = points[offset];
      const y = points[offset + 1];
      const z = points[offset + 2];
      const yawX = x * cosY + z * sinY;
      const yawZ = z * cosY - x * sinY;
      const pitchY = y * cosX - yawZ * sinX;
      const depth = y * sinX + yawZ * cosX;
      const size = scale / (1 - 0.21 * depth);

      projected[offset] = centerX + (yawX * cosR - pitchY * sinR) * size;
      projected[offset + 1] = centerY + (yawX * sinR + pitchY * cosR) * size;
      projected[offset + 2] = depth;
    }

    for (const section of sections) {
      const ring = section.index * STEPS + STEPS / 2;
      const offset = ring * FIBRES * 3;
      section.depth = (projected[offset + 2] + projected[offset + FIBRES / 2 * 3 + 2]) / 2;
    }

    sections.sort((a, b) => a.depth - b.depth);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    for (const section of sections) {
      const step = section.index * STEPS;
      const middle = (step + STEPS / 2) * FIBRES * 3;
      const [red, green, blue] = shades[section.index];
      let firstEdge = -1;
      let lastEdge = -1;

      for (let fibre = 0; fibre < FIBRES; fibre += 1) {
        const offset = middle + fibre * 3;
        const nx = normals[offset];
        const ny = normals[offset + 1];
        const nz = normals[offset + 2];
        nearSide[fibre] = ny * sinX + (nz * cosY - nx * sinY) * cosX > -0.025;
      }

      for (let fibre = 0; fibre < FIBRES; fibre += 1) {
        const prior = nearSide[(fibre + FIBRES - 1) % FIBRES];
        if (nearSide[fibre] && !prior) firstEdge = fibre;
        if (!nearSide[fibre] && prior) lastEdge = (fibre + FIBRES - 1) % FIBRES;
      }

      if (firstEdge < 0 || lastEdge < 0) continue;

      const start = step * FIBRES * 3;
      const end = start + STEPS * FIBRES * 3;
      const visibleFibres = (lastEdge - firstEdge + FIBRES) % FIBRES + 1;
      context.beginPath();

      for (let edge = 0; edge < visibleFibres; edge += 1) {
        const fibre = (firstEdge + edge) % FIBRES;
        const offset = start + fibre * 3;
        if (edge === 0) context.moveTo(projected[offset], projected[offset + 1]);
        else context.lineTo(projected[offset], projected[offset + 1]);
      }
      for (let edge = visibleFibres - 1; edge >= 0; edge -= 1) {
        const fibre = (firstEdge + edge) % FIBRES;
        const offset = end + fibre * 3;
        context.lineTo(projected[offset], projected[offset + 1]);
      }

      context.closePath();
      const body = rgb(red * 0.105 + 7, green * 0.07 + 5, blue * 0.11 + 10);
      context.fillStyle = body;
      context.fill();
      context.strokeStyle = body;
      context.lineWidth = 1.2;
      context.stroke();

      for (let fibre = 0; fibre < FIBRES; fibre += 1) {
        if (!nearSide[fibre]) continue;

        const offset = middle + fibre * 3;
        const nx = normals[offset];
        const ny = normals[offset + 1];
        const nz = normals[offset + 2];
        const rotatedZ = nz * cosY - nx * sinY;
        const ax = nx * cosY + nz * sinY;
        const ay = ny * cosX - rotatedZ * sinX;
        const az = ny * sinX + rotatedZ * cosX;
        const light = Math.max(0, -0.33 * ax - 0.65 * ay + 0.69 * az);
        const glint = light ** 14;
        const rim = Math.max(0, 1 - az) ** 5;
        const strength = (0.38 + light * 0.64 + rim * 0.3) * fibreTexture[fibre];
        const specular = glint * 112;
        context.strokeStyle = rgb(red * strength + specular, green * strength + specular * 0.9, blue * strength + specular);
        context.lineWidth = (narrow ? 0.64 : 0.94) + glint * 0.42;
        context.beginPath();

        for (let ring = 0; ring <= STEPS; ring += 1) {
          const point = start + (ring * FIBRES + fibre) * 3;
          if (ring === 0) context.moveTo(projected[point], projected[point + 1]);
          else context.lineTo(projected[point], projected[point + 1]);
        }

        context.stroke();
      }
    }
  }

  function rgb(red, green, blue) {
    return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
  }

  function shouldAnimate() {
    return visible && !document.hidden && !paused && !motion.matches;
  }

  function updateAnimation() {
    if (!shouldAnimate()) {
      window.cancelAnimationFrame(scheduled);
      scheduled = 0;
      previousFrame = 0;
      return;
    }

    if (!scheduled) scheduled = window.requestAnimationFrame(animate);
  }

  function animate(timestamp) {
    scheduled = 0;
    if (!shouldAnimate()) return;

    if (timestamp - previousFrame >= 29) {
      const elapsed = previousFrame ? Math.min(50, timestamp - previousFrame) : 0;
      previousFrame = timestamp;
      time += elapsed / 1_000;
      pointerX += (targetX - pointerX) * 0.11;
      pointerY += (targetY - pointerY) * 0.11;
      paint();
    }

    updateAnimation();
  }

  stage.addEventListener('pointermove', (event) => {
    if (!pointer.matches || !shouldAnimate()) return;
    const bounds = stage.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
  });

  stage.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  }).observe(stage);

  document.addEventListener('visibilitychange', updateAnimation);
  motion.addEventListener('change', updateAnimation);
  resize();
  updateAnimation();

  return {
    setMode(index) {
      if (!Number.isInteger(index) || index < 0 || index >= PALETTES.length) return;
      activeMode = index;
      paint();
    },
    setPaused(value) {
      paused = Boolean(value);
      updateAnimation();
    },
  };
}
