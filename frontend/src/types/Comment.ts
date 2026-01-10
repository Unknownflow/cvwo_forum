type Comment = {
    id: number;
    header?: string;
    body: string;
    author: string;
    createdAt: string;
    postID: number;
    topicID: number;
    likesCount: number;
};

export type CommentRequest = Omit<Comment, "id" | "header" | "topicID" | "createdAt" | "likesCount">;

export default Comment;
