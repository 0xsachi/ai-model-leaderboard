# AI Model Leaderboard

Open-source leaderboard ranking open-source and open-weight AI models by performance benchmarks.

## Features

- 39 open-source/open-weight models across 3 tiers (Frontier, Mid-Size, Efficient)
- Sortable columns: model, organization, params, context window, license, MMLU, HumanEval, GPQA, overall score
- Filter by text search or organization
- Dark theme, fast-loading static site
- Built with Next.js 16, TypeScript, and Tailwind CSS 4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
npm run build
```

Generates a static export in `out/` ready for deployment to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Data

Model data lives in `src/data/models.ts`. Scores are approximate, sourced from public benchmarks. PRs welcome to update or add models.

## Contributing

1. Fork the repo
2. Add/update model data in `src/data/models.ts`
3. Submit a PR

## License

MIT
