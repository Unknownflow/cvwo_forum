import Post from "../types/Post";
import PostRequest from "../types/PostRequest";
import axios from "axios";

const addr = process.env.REACT_APP_API_BASE_URL + "/posts/";

const readPosts = async () => {
    const response = await axios.get(addr);
    return response.data;
};

const readPost = async (id: number) => {
    const response = await axios.get(addr + id);
    return response.data;
};

const readPostComments = async (id: number) => {
    const response = await axios.get(addr + id + "/comments");
    return response.data;
};

const createPost = async (newPost: PostRequest) => {
    const response = await axios.post(addr, newPost);
    return response.data;
};

const updatePost = async (newPost: Post) => {
    const response = await axios.put(addr + newPost.id, newPost);
    return response.data;
};

const deletePost = async (id: number) => {
    const response = await axios.delete(addr + id);
    return response.data;
};

export { readPosts, readPost, readPostComments, createPost, updatePost, deletePost };
