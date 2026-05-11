"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getCategoryColor } from "@/lib/category-colors";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onCategoryDeleted?: () => void; // 삭제 후 부모에서 목록 갱신 원하면 optional로 받음
}

export default function CategoryCombobox({ value, onChange, onCategoryDeleted }: Props) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState(value);
    const [categories, setCategories] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) setCategories(await res.json());
        } catch {}
    }, []);

    useEffect(() => {
        if (open) fetchCategories();
    }, [open, fetchCategories]);


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const filtered = input.trim()
        ? categories.filter((c) => c.toLowerCase().includes(input.toLowerCase()))
        : categories;

    const trimmed = input.trim();
    const showCreate = trimmed && !categories.some((c) => c === trimmed);

    function select(cat: string) {
        setInput("");
        onChange(cat);
        setOpen(false);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
        setOpen(true);
    }

    function handleClear() {
        setInput("");
        onChange("");
    }

    async function handleDeleteCategory(e: React.MouseEvent, cat: string) {
        e.preventDefault();
        e.stopPropagation();

        await fetch("/api/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: cat }),
        });

        // 삭제한 카테고리가 현재 선택된 값이면 초기화
        if (value === cat) {
            setInput("");
            onChange("");
        }

        setCategories((prev) => prev.filter((c) => c !== cat));
        onCategoryDeleted?.();
    }

    return (
        <div ref={containerRef} className="relative w-full sm:w-44">
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-1.5 focus-within:ring-2 focus-within:ring-rose-300 bg-white">
                {value && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getCategoryColor(value)}`}>
            {value}
          </span>
                )}
                <input
                    type="text"
                    placeholder={value ? "" : "카테고리 (선택)"}
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent"
                    style={{ width: value ? "4px" : undefined }}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                        tabIndex={-1}
                    >
                        ×
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Select an option or create one</p>
                    <ul className="max-h-52 overflow-y-auto pb-1">
                        {filtered.map((cat) => (
                            <li key={cat}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); select(cat); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-sm group"
                                >
                                    <span className="text-gray-300 text-xs">⠿</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(cat)}`}>
                    {cat}
                  </span>
                                    <span className="ml-auto pl-2 text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                          onMouseDown={(e) => handleDeleteCategory(e, cat)}
                                    >
                    ×
                  </span>
                                </button>
                            </li>
                        ))}
                        {showCreate && (
                            <li>
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); select(trimmed); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-sm text-gray-600"
                                >
                                    <span>Create</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(trimmed)}`}>
                    {trimmed}
                  </span>
                                </button>
                            </li>
                        )}
                        {filtered.length === 0 && !showCreate && (
                            <li className="px-3 py-2 text-xs text-gray-400">카테고리가 없습니다.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}