import PostLike from "../types/PostLike";
import axiosInstance from "../utils/axios";

const route = "/posts/likes/";

const readPostsLikes = async (order: string) => {
    const response = await axiosInstance.get(route + "?order=" + order);
    return response.data;
};

const readPostLikes = async (id: number) => {
    const response = await axiosInstance.get(route + id);
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

const readPostLikesCount = async (id: number) => {
    const response = await axiosInstance.get(route + id + "/count");
    return response.data;
};

export { readPostsLikes, readPostLikes, createPostLike, deletePostLike, readPostLikesCount };
