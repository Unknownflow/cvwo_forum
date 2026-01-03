type Post = {
    id: number;
    header: string;
    body: string;
    author: string;
    createdAt: string;
    topicID: number;
    likesCount: number;
    commentsCount: number;
};

export type PostRequest = Omit<Post, "id" | "createdAt" | "likesCount" | "commentsCount">;

export default Post;
