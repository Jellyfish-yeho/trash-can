"use client";

import {useState, useEffect, useCallback, Suspense} from "react";
import {useSearchParams} from "next/navigation";
import PostForm from "./PostForm";
import SortBar from "./SortBar";
import DateGroup from "./DateGroup";
import {PostWithCounts} from "@/app/types";

function getDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();

    const toLocal = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const today = toLocal(now);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const target = toLocal(d);

    if (target.getTime() === today.getTime()) return "오늘";
    if (target.getTime() === yesterday.getTime()) return "어제";
    return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function groupByDate(posts: PostWithCounts[]): Map<string, PostWithCounts[]> {
    const map = new Map<string, PostWithCounts[]>();
    for (const post of posts) {
        const label = getDateLabel(post.date);
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
            ) : (
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
