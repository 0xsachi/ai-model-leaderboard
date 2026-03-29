"use client";

import { useState, useMemo } from "react";
import { models, type Model } from "@/data/models";

type SortKey = keyof Model;
type SortDir = "asc" | "desc";

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Model" },
  { key: "organization", label: "Organization" },
  { key: "params", label: "Params" },
  { key: "contextWindow", label: "Context", align: "right" },
  { key: "license", label: "License" },
  { key: "mmlu", label: "MMLU", align: "right" },
  { key: "humanEval", label: "HumanEval", align: "right" },
  { key: "gpqa", label: "GPQA", align: "right" },
  { key: "overallScore", label: "Score", align: "right" },
];

function formatCtx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000).toFixed(0)}K`;
}

function formatScore(n: number | null): string {
  return n == null ? "—" : n.toFixed(1);
}

export default function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const organizations = useMemo(
    () => Array.from(new Set(models.map((m) => m.organization))).sort(),
    []
  );

  const sorted = useMemo(() => {
    let filtered = models.filter((m) => {
      const matchesText =
        m.name.toLowerCase().includes(filter.toLowerCase()) ||
        m.organization.toLowerCase().includes(filter.toLowerCase());
      const matchesOrg =
        orgFilter === "all" || m.organization === orgFilter;
      return matchesText && matchesOrg;
    });

    return filtered.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [sortKey, sortDir, filter, orgFilter]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "organization" || key === "params" || key === "license" ? "asc" : "desc");
    }
  }

  function rankOf(model: Model): number {
    const byScore = [...models].sort(
      (a, b) => b.overallScore - a.overallScore
    );
    return byScore.findIndex((m) => m.name === model.name) + 1;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search models..."
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
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
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {rankOf(model)}
                </td>
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {model.name}
                </td>
                <td className="px-4 py-3 text-gray-300">{model.organization}</td>
                <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                  {model.params}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono">
                  {formatCtx(model.contextWindow)}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {model.license}
                </td>
                <td className="px-4 py-3 text-right font-mono">
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
                <td className="px-4 py-3 text-right font-mono">
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
                <td className="px-4 py-3 text-right font-mono">
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
                <td className="px-4 py-3 text-right font-mono font-bold">
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
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={10}
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
        {sorted.length} model{sorted.length !== 1 ? "s" : ""} shown. Click
        column headers to sort. Scores are approximate from public benchmarks.
        Open-source and open-weight models only.
      </p>
    </div>
  );
}
