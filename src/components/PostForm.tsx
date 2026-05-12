"use client";

import { useState } from "react";
import CategoryCombobox from "./CategoryCombobox";
import {PostWithCounts} from "@/app/types";

interface Props {
    onPostCreated: (post: PostWithCounts) => void;
}

function getLocalDate() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10); // "2026-05-12"
}
function buildDateWithCurrentTime(dateOnly: string) {
    // 날짜는 사용자 선택, 시간은 현재 로컬 시각
    const now = new Date();
    const result = new Date(
        `${dateOnly}T${now.toTimeString().slice(0, 8)}` // "2026-05-12T15:33:00"
    );
    return result.toISOString(); // UTC로 변환해서 전송
}

export default function PostForm({ onPostCreated }: Props) {
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(getLocalDate);
    const [loading, setLoading] = useState(false);      // boolean
    const [error, setError] = useState("");

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
                body: JSON.stringify({ content, category }),
            });
            if (!res.ok) throw new Error("등록 실패");
            const post = await res.json();
            onPostCreated(post);
            setContent("");
            setCategory("");
            setDate(getLocalDate());
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