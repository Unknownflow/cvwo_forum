type Comment = {
    id: number;
    body: string;
    author: string;
    createdAt: string;
    postID: number;
    likesCount: number;
};

export type CommentRequest = Omit<Comment, "id" | "createdAt" | "likesCount">;

export default Comment;
