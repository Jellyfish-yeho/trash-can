"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "popular", label: "인기순" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") ?? "latest") as SortValue;
  const date = searchParams.get("date") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update("sort", opt.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              sort === opt.value
                ? "bg-white shadow text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <input
          type="date"
          value={date}
          onChange={(e) => update("date", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        {date && (
          <button
            onClick={() => update("date", "")}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
