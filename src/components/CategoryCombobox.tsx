"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { randomCategoryColor } from "@/lib/category-colors";

interface Props {
    value: string;
    onChange: (value: string, color?: string) => void;
    onCategoryDeleted?: () => void;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

export default function CategoryCombobox({ value, onChange, onCategoryDeleted }: Props) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [previewColor, setPreviewColor] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const trimmed = input.trim();

    // trimmed 바뀔 때마다 랜덤 컬러 고정
    useEffect(() => {
        if (trimmed) setPreviewColor(randomCategoryColor());
    }, [trimmed]);

    const filtered = trimmed
        ? categories.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
        : categories;

    const showCreate = trimmed && !categories.some((c) => c.name === trimmed);

    const selectedCategory = categories.find((c) => c.name === value);

    function select(cat: Category) {
        setInput("");
        onChange(cat.name, cat.color);
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

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // 태그 선택된 상태에서 백스페이스 누르면 태그 제거
        if (e.key === "Backspace" && value && !input) {
            handleClear();
        }
    }

    async function handleCreate() {
        const category = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed, color: previewColor }),
        }).then((res) => res.json());

        setCategories((prev) => [...prev, category]);
        setInput("");
        onChange(category.name, category.color);
        setOpen(false);
    }

    async function handleDeleteCategory(e: React.MouseEvent, cat: Category) {
        e.preventDefault();
        e.stopPropagation();

        await fetch("/api/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: cat.name }),
        });

        if (value === cat.name) {
            setInput("");
            onChange("");
        }

        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        onCategoryDeleted?.();
    }

    return (
        <div ref={containerRef} className="relative w-full sm:w-44">
            <div
                className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-1.5 focus-within:ring-2 focus-within:ring-rose-300 bg-white cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {value && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${selectedCategory?.color ?? "bg-gray-100 text-gray-600"}`}>
            {value}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            className="opacity-60 hover:opacity-100 leading-none"
                            tabIndex={-1}
                        >
              ×
            </button>
          </span>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={value ? "" : "카테고리 (선택)"}
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent"
                    style={{ width: value ? "4px" : undefined }}
                />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Select an option or create one</p>
                    <ul className="max-h-52 overflow-y-auto pb-1">
                        {filtered.map((cat) => (
                            <li key={cat.id}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); select(cat); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-sm group"
                                >
                                    <span className="text-gray-300 text-xs">⠿</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
                    {cat.name}
                  </span>
                                    <span
                                        className="ml-auto pl-2 text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-sm text-gray-600"
                                >
                                    <span>Create</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${previewColor}`}>
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