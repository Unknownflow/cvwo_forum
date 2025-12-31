import Post from "../types/Post";
import PostRequest from "../types/PostRequest";
import axiosInstance from "../utils/axios";

const route = "/posts/";

const readPosts = async () => {
    const response = await axiosInstance.get(route);
    return response.data;
};

const readPost = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    return response.data;
};

const readPostComments = async (id: number, order: string) => {
    const response = await axiosInstance.get(route + id + "/comments?order=" + order);
    return response.data;
};

const createPost = async (newPost: PostRequest) => {
    const response = await axiosInstance.post(route, newPost);
    return response.data;
};

const updatePost = async (newPost: Post) => {
    const response = await axiosInstance.put(route + newPost.id, newPost);
    return response.data;
};

const deletePost = async (id: number) => {
    const response = await axiosInstance.delete(route + id);
    return response.data;
};

export { readPosts, readPost, readPostComments, createPost, updatePost, deletePost };
