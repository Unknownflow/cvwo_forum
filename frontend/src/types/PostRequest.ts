import Post from "./Post";

type PostRequest = Omit<Post, "id" | "created_at" | "likes_count">;

export default PostRequest;
