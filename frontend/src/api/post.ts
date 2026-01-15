import Post, { PostRequest } from "../types/Post";
import axiosInstance from "../utils/axios";

const route = "/posts/";

const readPost = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    return response.data;
};

const readPostsByUser = async (user: string) => {
    const response = await axiosInstance.get(route + "user/" + user);
    return response.data;
};

const readPostComments = async (id: number, order: string, searchTerm: string) => {
    const orderArr = order.split(", ");
    const response = await axiosInstance.get(
        `${route}${id}/comments?key=${orderArr[0]}&order=${orderArr[1]}&searchTerm=${searchTerm}`,
    );
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

export { readPost, readPostsByUser, readPostComments, createPost, updatePost, deletePost };
