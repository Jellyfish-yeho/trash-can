"use client";

import { useState } from "react";
import CategoryCombobox from "./CategoryCombobox";
import {PostWithCounts} from "@/app/types";

interface Props {
    onPostCreated: (post: PostWithCounts) => void;
}

function getLocalDatetime() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
}
function getLocalDate() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10); // "2026-05-11"
}

export default function PostForm({ onPostCreated }: Props) {
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(getLocalDate);
    const [loading, setLoading] = useState(false);      // boolean
    const [error, setError] = useState("");

    // 날짜 바꿀 때 현재 시각 붙이기
    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedDate = e.target.value; // "2026-05-11"
        const now = new Date();
        const hhmm = now.toTimeString().slice(0, 5); // "15:30"
        setDate(`${selectedDate}T${hhmm}`); // "2026-05-11T15:30" 형식으로 저장
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) {
            setError("내용을 입력해주세요.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, category, date }),
            });
            if (!res.ok) throw new Error("등록 실패");
            const post = await res.json();
            onPostCreated(post);
            setContent("");
            setCategory("");
            setDate(getLocalDatetime());
        } catch {
            setError("등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
        >
            <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                새 글 작성
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="date"
                    value={date.slice(0, 10)}
                    onChange={handleDateChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 w-full sm:w-40"
                />
                <CategoryCombobox value={category} onChange={setCategory} />
                <input
                    type="text"
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 flex-1 min-w-0"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? "등록 중..." : "등록"}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    );
}