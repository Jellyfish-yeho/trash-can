"use client";

import {useState, useEffect, useCallback, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import PostForm from "./PostForm";
import SortBar from "./SortBar";
import DateGroup from "./DateGroup";
import {PostWithCounts} from "@/app/types";
import PostCard from "@/components/PostCard";

function getDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();

    // UTC 문자열만 KST로 변환
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
    const date = searchParams.get("date") ?? "";

    const [posts, setPosts] = useState<PostWithCounts[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("sort", sort);
            if (date) params.set("date", date);
            const res = await fetch(`/api/posts?${params.toString()}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPosts(data);
        } catch {
        } finally {
            if (!silent) setLoading(false);
        }
    }, [sort, date]);


    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    function handlePostCreated(post: PostWithCounts) {
        if (sort === "oldest") {
            setPosts((prev) => [...prev, post]);
        } else {
            setPosts((prev) => [post, ...prev]);
        }
        fetchPosts(true);

    }

    function handlePostDeleted(id: string) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    const groups = groupByDate(posts);

    return (
        <div>
            <PostForm onPostCreated={handlePostCreated}/>
            <SortBar/>
            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    아직 글이 없습니다. 첫 글을 작성해보세요!
                </div>
            ) : sort === "popular" ? (
                // 인기순: 그룹핑 없이 바로 출력
                <div className="space-y-3 pl-1">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onDeleted={handlePostDeleted}/>
                    ))}
                </div>
            ) : (
                // 최신순/오래된순: 날짜별 그룹핑
                <div>
                    {Array.from(groups.entries()).map(([label, groupPosts]) => (
                        <DateGroup key={label} label={label} posts={groupPosts} onDeleted={handlePostDeleted}/>
                    ))}
                </div>
            )}
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
            <FeedInner/>
        </Suspense>
    );
}
