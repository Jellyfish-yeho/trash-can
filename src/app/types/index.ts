export interface CommentWithCount {
    id: string;
    postId: string;
    content: string;
    createdAt: string;
    _count: { likes: number };
}

export interface PostWithCounts {
    id: string;
    content: string;
    imageUrl: string | null;  // ← 추가
    category: { id: string; name: string; color: string } | null;
    createdAt: string;
    _count: { likes: number; comments: number };
    comments: CommentWithCount[];
}