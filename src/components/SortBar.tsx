"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useOpacity } from "@/app/context/OpacityContext";

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
    const { opacity, setOpacity } = useOpacity();

    const update = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(key, value);
            else params.delete(key);
            router.push(`?${params.toString()}`);
        },
        [router, searchParams]
    );

    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
            </div>

            {/* 투명도 슬라이더 */}
            <div className="flex items-center gap-3 justify-end">
                <span className="text-xs text-gray-400 shrink-0">글자 투명도</span>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-1/4 accent-rose-400"
                />
                <span className="text-xs text-gray-400 w-8 text-right">{opacity}%</span>
            </div>
        </div>
    );
}