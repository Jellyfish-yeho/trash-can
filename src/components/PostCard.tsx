"use client";

import {useEffect, useState} from "react";
import CommentSection from "./CommentSection";
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

export default function PostCard({post, onDeleted}: Props) {
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [commentCount, setCommentCount] = useState(post._count.comments);
    const [comments, setComments] = useState(post.comments);
    const [showComments, setShowComments] = useState(post.comments.length > 0);
    const [deleting, setDeleting] = useState(false);
    const [imageOpen, setImageOpen] = useState(false);
    const [translated, setTranslated] = useState<string | null>(null);
    const [translating, setTranslating] = useState(false);

    const {opacity} = useOpacity();

    async function handleTranslate() {
        if (translated) {
            setTranslated(null); // 다시 누르면 원문으로
            return;
        }
        setTranslating(true);
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: post.content }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTranslated(data.translated);
        } catch {
        } finally {
            setTranslating(false);
        }
    }

    async function handleLike() {
        setLikeCount((n) => n + 1);
        try {
            const res = await fetch(`/api/posts/${post.id}/like`, {method: "POST"});
            if (!res.ok) throw new Error();
            const {count} = await res.json();
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
                c.id === commentId ? {...c, _count: {likes: count}} : c
            )
        );
    }

    async function handleDelete() {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${post.id}`, {method: "DELETE"});
            if (!res.ok) throw new Error();
            onDeleted(post.id);
        } catch {
            setDeleting(false);
        }
    }

    useEffect(() => {
        setLikeCount(post._count.likes);
        setCommentCount(post._count.comments);
        setComments(post.comments);
    }, [post]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">

            {/* 1행: 카테고리 + 삭제 버튼 */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    {post.category && (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${post.category.color}`}>
                        {post.category.name}
                    </span>
                    )}
                </div>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-gray-300 hover:text-red-400 transition text-xs shrink-0 disabled:opacity-40"
                >
                    ✕
                </button>
            </div>

            {/* 한국어가 아닌 경우만 번역 버튼 표시 */}
            {/[a-zA-Z\u4e00-\u9fff\u3040-\u30ff]/.test(post.content) && (
                <button
                    onClick={handleTranslate}
                    disabled={translating}
                    className="text-xs text-gray-400 hover:text-blue-400 transition mb-2 disabled:opacity-40"
                >
                    {translating ? "번역 중..." : translated ? "원문 보기" : "🌐 번역"}
                </button>
            )}

            {/* 2행: 텍스트 */}
            <p
                className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap transition-opacity duration-200 mb-2"
                style={{opacity: opacity / 100}}
            >
                {translated ?? post.content}
            </p>

            {/* 3행: 이미지 */}
            {post.imageUrl && (
                <>
                    <img
                        src={post.imageUrl}
                        alt="첨부 이미지"
                        className="mt-1 mb-2 rounded-xl max-h-32 object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => setImageOpen(true)}
                        style={{opacity: opacity / 100}}
                    />
                    {/* 이미지 미리보기 모달 */}
                    {imageOpen && (
                        <div
                            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                            onClick={() => setImageOpen(false)}
                        >
                            <img
                                src={post.imageUrl}
                                alt="이미지 미리보기"
                                className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </>
            )}

            {/* 4행: 시간 + 좋아요 + 댓글 */}
            <div className="flex items-center gap-4 mt-2">
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
                <CommentSection
                    postId={post.id}
                    comments={comments}
                    onCommentAdded={handleCommentAdded}
                    onCommentLiked={handleCommentLiked}
                />
            )}
        </div>
    );
}