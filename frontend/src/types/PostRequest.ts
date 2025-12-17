import Post from "./Post";

type PostRequest = Omit<Post, "id" | "created_at">;

export default PostRequest;
