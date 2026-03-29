## <img src="./src/assets/page/xbl1e.png" width="28" style="vertical-align: middle; border-radius: 6px;"> xbl1e
My website — Vite + GSAP + Lenis + Three.js.

### <img height="18" src="./src/assets/readme/features.svg" style="vertical-align: middle;">&nbsp;&nbsp;Structure

```mermaid
graph TD
    A[main.js] --> B[components/cards]
    A --> C[components/shared]
    A --> D[utils]
    B --> E[githubHeatmap]
    B --> F[githubStats]
    B --> G[githubLangs]
    B --> H[projectGrid]
    B --> I[discordPresence]
    B --> J[networkFlow]
    B --> K[systemMetrics]
    C --> L[interactions]
    D --> M[github.js]
    D --> N[colors.js]
    D --> O[format.js]
```

```
src/
├── main.js                 # Entry point
├── components/
│   ├── cards/
│   │   ├── discordPresence.js   # Discord rich presence (Lanyard API)
│   │   ├── githubHeatmap.js     # Three.js contribution globe
│   │   ├── githubLangs.js       # Language donut chart
│   │   ├── githubStats.js       # Monthly stats line chart
│   │   ├── networkFlow.js        # Animated network canvas
│   │   ├── projectGrid.js       # GitHub repos renderer
│   │   └── systemMetrics.js      # Sparkline canvas
│   └── shared/
│       └── interactions.js       # GSAP: scramble, reveal, magnetic
├── styles/
│   └── main.css                 # CSS custom properties
└── utils/
    ├── colors.js                # PALETTE (accent, github levels, discord)
    ├── format.js                # Duration formatting
    └── github.js                # GitHub GraphQL/REST + caching
```
### <img height="18" src="./src/assets/readme/documentation.svg" style="vertical-align: middle;">&nbsp;&nbsp;Usage

```bash
npm install      # install dependencies
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview build
```

> [!NOTE]
> Optional: set `VITE_GITHUB_TOKEN` on `.env` for higher GitHub API rate limits. Without it, the site falls back to mock/limited data.