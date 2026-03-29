# AI Model Leaderboard

Open-source leaderboard ranking AI models by performance benchmarks and cost.

## Features

- 13 major AI models ranked by composite score
- Sortable columns: name, provider, context window, pricing, MMLU, HumanEval, GPQA, overall score
- Filter by text search or provider
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
