import Post from "./Post";

type PostRequest = Omit<Post, "id" | "createdAt" | "likesCount" | "commentsCount">;

export default PostRequest;
