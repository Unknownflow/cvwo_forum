type Post = {
    id: number;
    title?: string;
    header: string;
    body: string;
    author: string;
    createdAt: string;
    topicID: number;
    likesCount: number;
    commentsCount: number;
};

export type PostRequest = Omit<Post, "id" | "title" | "createdAt" | "likesCount" | "commentsCount">;

export default Post;
