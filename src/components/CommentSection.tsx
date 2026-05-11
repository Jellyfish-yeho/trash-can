"use client";

import { useState } from "react";
import {CommentWithCount} from "@/app/types";

interface Props {
    postId: string;
    comments: CommentWithCount[];
    onCommentAdded: (comment: CommentWithCount) => void;
    onCommentLiked: (commentId: string, count: number) => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({ postId, comments, onCommentAdded, onCommentLiked }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, number>>({});

    async function submitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: input }),
            });
            if (!res.ok) throw new Error();
            const comment = await res.json();
            onCommentAdded(comment);  // ← 부모한테 전달
            setInput("");
        } catch {
        } finally {
            setLoading(false);
        }
    }

    async function likeComment(id: string) {
        const prev = likedComments[id] ?? 0;
        setLikedComments((old) => ({ ...old, [id]: prev + 1 }));
        try {
            const res = await fetch(`/api/comments/${id}/like`, { method: "POST" });
            if (!res.ok) throw new Error();
            const { count } = await res.json();
            onCommentLiked(id, count);  // ← 부모한테 실제 count 전달
            setLikedComments((old) => ({ ...old, [id]: 0 }));  // optimistic 초기화
        } catch {
            setLikedComments((old) => ({ ...old, [id]: prev }));
        }
    }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="space-y-3 mb-3">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">아직 댓글이 없습니다.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2 group">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-sm text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-400 mt-1">{formatTime(c.createdAt)}</p>
            </div>
            <button
              onClick={() => likeComment(c.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition mt-1 shrink-0"
            >
              <span>❤️</span>
              <span>{c._count.likes}</span>
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-lg transition disabled:opacity-40"
        >
          등록
        </button>
      </form>
    </div>
  );
}
