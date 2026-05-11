"use client";

import { useState } from "react";
import PostCard from "./PostCard";

interface CommentWithCount {
    id: string;
    postId: string;
    content: string;
    createdAt: string;
    _count: { likes: number };
}

interface PostWithCounts {
    id: string;
    content: string;
    category: string | null;
    date: string;
    createdAt: string;
    _count: { likes: number; comments: number };
    comments: CommentWithCount[];
}

interface Props {
    label: string;
    posts: PostWithCounts[];
    onDeleted: (id: string) => void;
}

export default function DateGroup({ label, posts, onDeleted }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <div className="mb-6">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 mb-3 group"
            >
        <span className="text-gray-400 text-sm group-hover:text-gray-600 transition">
          {open ? "▼" : "▶"}
        </span>
                <span className="font-semibold text-gray-700 text-sm">{label}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {posts.length}
        </span>
            </button>
            {open && (
                <div className="space-y-3 pl-1">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onDeleted={onDeleted} />
                    ))}
                </div>
            )}
        </div>
    );
}