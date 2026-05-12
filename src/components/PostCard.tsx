"use client";

import { useState } from "react";
import CommentSection from "./CommentSection";
import { getCategoryColor } from "@/lib/category-colors";
import {CommentWithCount, PostWithCounts} from "@/app/types";
import {useOpacity} from "@/app/context/OpacityContext";

interface Props {
    post: PostWithCounts;
    onDeleted: (id: string) => void;
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function PostCard({ post, onDeleted }: Props) {
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [commentCount, setCommentCount] = useState(post._count.comments);
    const [comments, setComments] = useState(post.comments);
    const [showComments, setShowComments] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const { opacity } = useOpacity();

    async function handleLike() {
        setLikeCount((n) => n + 1);
        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
            if (!res.ok) throw new Error();
            const { count } = await res.json();
            setLikeCount(count);
        } catch {
            setLikeCount((n) => n - 1);
        }
    }

    function handleCommentAdded(comment: CommentWithCount) {
        setComments((prev) => [...prev, comment]);
        setCommentCount((n) => n + 1);
    }

    function handleCommentLiked(commentId: string, count: number) {
        setComments((prev) =>
            prev.map((c) =>
                c.id === commentId ? { ...c, _count: { likes: count } } : c
            )
        );
    }

    async function handleDelete() {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            onDeleted(post.id);
        } catch {
            setDeleting(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {post.category && (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getCategoryColor(post.category.name)}`}>
              {post.category.name}
            </span>
                    )}
                    <p
                        className="text-gray-800 text-sm leading-relaxed transition-opacity duration-200"
                        style={{ opacity: opacity / 100 }}
                    >
                        {post.content}
                    </p>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-gray-300 hover:text-red-400 transition text-xs shrink-0 disabled:opacity-40"
                >
                    ✕
                </button>
            </div>

            <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-gray-400">{formatTime(post.createdAt)}</span>
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition"
                >
                    <span>❤️</span>
                    <span>{likeCount}</span>
                    <span className="text-xs font-normal text-rose-400">공감</span>
                </button>
                <button
                    onClick={() => setShowComments((v) => !v)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition"
                >
                    <span>💬</span>
                    <span>{commentCount}</span>
                    <span className="text-xs">{showComments ? "닫기" : "댓글"}</span>
                </button>
            </div>

            {showComments && (
                <CommentSection postId={post.id} comments={comments} onCommentAdded={handleCommentAdded} onCommentLiked={handleCommentLiked} />
            )}
        </div>
    );
}