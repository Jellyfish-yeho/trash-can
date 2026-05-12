"use client";

import { useState } from "react";
import CategoryCombobox from "./CategoryCombobox";
import {PostWithCounts} from "@/app/types";

const MAX_CONTENT_LENGTH = 300;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface Props {
    onPostCreated: (post: PostWithCounts) => void;
}

export default function PostForm({ onPostCreated }: Props) {
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [categoryColor, setCategoryColor] = useState("");
    const [loading, setLoading] = useState(false);      // boolean
    const [error, setError] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setError(`이미지는 ${MAX_IMAGE_SIZE_MB}MB 이하만 업로드 가능합니다.`);
            return;
        }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError("");
    }

    function handleRemoveImage() {
        setImage(null);
        setImagePreview("");
    }

    function handleCategoryChange(name: string, color?: string) {
        setCategory(name);
        if (color) setCategoryColor(color);
        else setCategoryColor("");
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
            // 이미지 먼저 업로드
            let imageUrl: string | null = null;
            if (image) {
                const formData = new FormData();
                formData.append("file", image);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (!res.ok) throw new Error("이미지 업로드 실패");
                const data = await res.json();
                imageUrl = data.url;
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, category, categoryColor, imageUrl }),
            });
            if (!res.ok) throw new Error("등록 실패");
            const post = await res.json();
            onPostCreated(post);
            setContent("");
            setCategory("");
            setCategoryColor("");
            setImage(null);
            setImagePreview("");
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
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                새 글 작성
            </h2>

            {/* 1행: 카테고리 + 이미지 업로드 */}
            <div className="flex items-center gap-2 mb-3">
                <CategoryCombobox value={category} onChange={handleCategoryChange} />
                <label className="cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition border border-gray-200 rounded-lg px-3 py-2 shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    📎 <span>이미지</span>
                </label>
            </div>

            {/* 이미지 미리보기 */}
            {imagePreview && (
                <div className="relative w-24 h-24 mb-3">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* 2행: 텍스트 입력 */}
            <textarea
                placeholder="내용을 입력하세요..."
                value={content}
                onChange={(e) => {
                    if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                        setContent(e.target.value);
                    }
                }}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none mb-1"
            />

            {/* 글자수 카운터 */}
            <div className="flex justify-end mb-3">
              <span className={`text-xs ${content.length >= MAX_CONTENT_LENGTH ? "text-red-400" : "text-gray-400"}`}>
                {content.length} / {MAX_CONTENT_LENGTH}
              </span>
            </div>

            {/* 3행: 등록 버튼 */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                    {loading ? "등록 중..." : "등록"}
                </button>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    );
}