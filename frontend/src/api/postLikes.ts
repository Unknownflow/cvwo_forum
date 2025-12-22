import PostLike from "../types/PostLike";
import axiosInstance from "../utils/axios";

const route = "/posts/likes/";

const readPostsLikes = async () => {
    const response = await axiosInstance.get(route);
    return response.data;
};

const readPostLikes = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    console.log("response", response.data);
    return response.data;
};

const createPostLike = async (newPostLike: PostLike) => {
    const response = await axiosInstance.post(route, newPostLike);
    return response.data;
};

const deletePostLike = async (id: number) => {
    const response = await axiosInstance.delete(route + id);
    return response.data;
};

export { readPostsLikes, readPostLikes, createPostLike, deletePostLike };
