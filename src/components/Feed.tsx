"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PostForm from "./PostForm";
import SortBar from "./SortBar";
import DateGroup from "./DateGroup";
import PostCard from "./PostCard";
import { PostWithCounts } from "@/app/types";

function getDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();

    const toKST = (date: Date) => {
        const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return `${kst.getUTCFullYear()}-${kst.getUTCMonth()}-${kst.getUTCDate()}`;
    };

    const today = toKST(now);
    const yesterday = toKST(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const target = toKST(d);

    if (target === today) return "오늘";
    if (target === yesterday) return "어제";

    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

function groupByDate(posts: PostWithCounts[]): Map<string, PostWithCounts[]> {
    const map = new Map<string, PostWithCounts[]>();
    for (const post of posts) {
        const label = getDateLabel(post.createdAt);
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(post);
    }
    return map;
}

function FeedInner() {
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") ?? "latest";

    const [posts, setPosts] = useState<PostWithCounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement>(null);

    const fetchPosts = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("sort", sort);
            const res = await fetch(`/api/posts?${params.toString()}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPosts(data.posts);
            setNextCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
        } catch {
        } finally {
            if (!silent) setLoading(false);
        }
    }, [sort]);

    const fetchMore = useCallback(async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const params = new URLSearchParams();
            params.set("sort", sort);
            params.set("cursor", nextCursor);
            const res = await fetch(`/api/posts?${params.toString()}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPosts((prev) => [...prev, ...data.posts]);
            setNextCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
        } catch {
        } finally {
            setLoadingMore(false);
        }
    }, [nextCursor, loadingMore, sort]);

    // sort 바뀌면 리셋
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Intersection Observer
    useEffect(() => {
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [fetchMore, hasMore, loadingMore]);

    function handlePostCreated(post: PostWithCounts) {
        setPosts((prev) => [post, ...prev]);
    }

    function handlePostDeleted(id: string) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    const groups = groupByDate(posts);

    return (
        <div>
            <PostForm onPostCreated={handlePostCreated} />
            <SortBar />
            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    아직 글이 없습니다. 첫 글을 작성해보세요!
                </div>
            ) : sort === "popular" ? (
                <div className="space-y-3 pl-1">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                    ))}
                </div>
            ) : (
                <div>
                    {Array.from(groups.entries()).map(([label, groupPosts]) => (
                        <DateGroup key={label} label={label} posts={groupPosts} onDeleted={handlePostDeleted} />
                    ))}
                </div>
            )}

            {/* 무한 스크롤 트리거 */}
            <div ref={observerRef} className="py-4 text-center">
                {loadingMore && <span className="text-xs text-gray-400">불러오는 중...</span>}
                {!hasMore && posts.length > 0 && (
                    <span className="text-xs text-gray-300">모든 글을 불러왔습니다.</span>
                )}
            </div>
        </div>
    );
}

export default function Feed() {
    return (
        <Suspense
            fallback={
                <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
            }
        >
            <FeedInner />
        </Suspense>
    );
}