import Post from "./Post";

type PostRequest = Omit<Post, "id" | "createdAt">;

export default PostRequest;
