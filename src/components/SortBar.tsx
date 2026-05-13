"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useOpacity } from "@/app/context/OpacityContext";

const SORT_OPTIONS = [
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "popular", label: "인기순" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface Category {
    id: string;
    name: string;
    color: string;
}

export default function SortBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sort = (searchParams.get("sort") ?? "latest") as SortValue;
    const category = searchParams.get("category") ?? "";
    const { opacity, setOpacity } = useOpacity();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then(setCategories)
            .catch(() => {});
    }, []);

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
                {/* 정렬 */}
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

                {/* 카테고리 드롭다운 */}
                <div className="flex items-center gap-2">
                    <select
                        value={category}
                        onChange={(e) => update("category", e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-gray-700"
                    >
                        <option value="">전체 카테고리</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {category && (
                        <button
                            onClick={() => update("category", "")}
                            className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                            초기화
                        </button>
                    )}
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