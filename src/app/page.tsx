import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          AI Model Leaderboard
        </h1>
        <p className="mt-2 text-gray-400">
          Open-source rankings of AI models by performance benchmarks and cost.
          Sortable, filterable, community-driven.
        </p>
      </div>
      <Leaderboard />
      <footer className="mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
        <p>
          Open source &middot; Data sourced from public benchmarks &middot;{" "}
          <a
            href="https://github.com"
            className="text-gray-500 hover:text-gray-300 underline"
          >
            Contribute on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
