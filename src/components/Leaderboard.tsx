"use client";

import { useState, useMemo } from "react";
import { models, type Model } from "@/data/models";

type SortKey = keyof Model;
type SortDir = "asc" | "desc";

const tierLabels: Record<Model["tier"], string> = {
  frontier: "Frontier",
  mid: "Mid-Size",
  small: "Small",
};

const tierColors: Record<Model["tier"], string> = {
  frontier: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  mid: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  small: "bg-green-500/20 text-green-300 border-green-500/30",
};

// Precompute global ranks once
const globalRanks = new Map<string, number>();
[...models]
  .sort((a, b) => b.overallScore - a.overallScore)
  .forEach((m, i) => globalRanks.set(m.name, i + 1));

type Column = {
  key: SortKey;
  label: string;
  align?: "right";
  group?: "benchmark" | "cost" | "info";
};

const columns: Column[] = [
  { key: "name", label: "Model", group: "info" },
  { key: "overallScore", label: "Score", align: "right", group: "benchmark" },
  { key: "organization", label: "Org", group: "info" },
  { key: "params", label: "Params", group: "info" },
  { key: "contextWindow", label: "Context", align: "right", group: "info" },
  { key: "license", label: "License", group: "info" },
  { key: "mmlu", label: "MMLU", align: "right", group: "benchmark" },
  { key: "humanEval", label: "HumanEval", align: "right", group: "benchmark" },
  { key: "gpqa", label: "GPQA", align: "right", group: "benchmark" },
  { key: "inputCostPer1M", label: "In $/1M", align: "right", group: "cost" },
  { key: "outputCostPer1M", label: "Out $/1M", align: "right", group: "cost" },
];

const stringKeys = new Set<SortKey>(["name", "organization", "params", "license", "tier"]);

function formatCtx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000).toFixed(0)}K`;
}

function formatScore(n: number | null): string {
  return n == null ? "\u2014" : n.toFixed(1);
}

function formatCost(n: number | null): string {
  if (n == null) return "\u2014";
  return `$${n.toFixed(2)}`;
}

export default function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const organizations = useMemo(
    () => Array.from(new Set(models.map((m) => m.organization))).sort(),
    []
  );

  const sorted = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    let filtered = models.filter((m) => {
      const matchesText =
        m.name.toLowerCase().includes(lowerFilter) ||
        m.organization.toLowerCase().includes(lowerFilter);
      const matchesOrg = orgFilter === "all" || m.organization === orgFilter;
      const matchesTier = tierFilter === "all" || m.tier === tierFilter;
      return matchesText && matchesOrg && matchesTier;
    });

    return filtered.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [sortKey, sortDir, filter, orgFilter, tierFilter]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(stringKeys.has(key) ? "asc" : "desc");
    }
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
          <span className="text-gray-500">Models:</span>{" "}
          <span className="text-white font-semibold">{models.length}</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
          <span className="text-gray-500">Organizations:</span>{" "}
          <span className="text-white font-semibold">{organizations.length}</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
          <span className="text-gray-500">Last updated:</span>{" "}
          <span className="text-white font-semibold">March 2026</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search models or organizations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        />
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Organizations</option>
          {organizations.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tiers</option>
          <option value="frontier">Frontier (100B+)</option>
          <option value="mid">Mid-Size (30-100B)</option>
          <option value="small">Small (&lt;30B)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${
                    col.group === "benchmark"
                      ? "text-blue-400/70"
                      : col.group === "cost"
                      ? "text-amber-400/70"
                      : "text-gray-400"
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">
                      {sortDir === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((model, i) => (
              <tr
                key={model.name}
                className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"
                }`}
              >
                <td className="px-3 py-3 text-gray-500 font-mono text-xs">
                  {globalRanks.get(model.name)}
                </td>
                <td className="px-3 py-3 font-medium text-white whitespace-nowrap">
                  {model.name}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold">
                  <span
                    className={
                      model.overallScore >= 88
                        ? "text-blue-400"
                        : model.overallScore >= 75
                        ? "text-gray-200"
                        : "text-gray-400"
                    }
                  >
                    {model.overallScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-300">{model.organization}</td>
                <td className="px-3 py-3 text-gray-300 text-xs whitespace-nowrap">
                  {model.params}
                </td>
                <td className="px-3 py-3 text-right text-gray-300 font-mono">
                  {formatCtx(model.contextWindow)}
                </td>
                <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {model.license}
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  <span
                    className={
                      model.mmlu && model.mmlu >= 88
                        ? "text-green-400"
                        : "text-gray-300"
                    }
                  >
                    {formatScore(model.mmlu)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  <span
                    className={
                      model.humanEval && model.humanEval >= 88
                        ? "text-green-400"
                        : "text-gray-300"
                    }
                  >
                    {formatScore(model.humanEval)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  <span
                    className={
                      model.gpqa && model.gpqa >= 55
                        ? "text-green-400"
                        : "text-gray-300"
                    }
                  >
                    {formatScore(model.gpqa)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-amber-300/80">
                  {formatCost(model.inputCostPer1M)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-amber-300/80">
                  {formatCost(model.outputCostPer1M)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full border ${tierColors[model.tier]}`}
                  >
                    {tierLabels[model.tier]}
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No models match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        {sorted.length} model{sorted.length !== 1 ? "s" : ""} shown &middot;
        Click column headers to sort &middot; Scores from public benchmarks
        &middot; Cost reflects typical API provider pricing &middot; Open-source
        and open-weight models only
      </p>
    </div>
  );
}
