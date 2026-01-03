import Comment from "./Comment";

type CommentRequest = Omit<Comment, "id" | "createdAt" | "likesCount">;

export default CommentRequest;
