import PostLike from "../types/PostLike";
import axiosInstance from "../utils/axios";

const route = "/posts/likes/";

const readPostsLikes = async (order: string) => {
    const orderArr = order.split(", ");
    const response = await axiosInstance.get(`${route}?key=${orderArr[0]}&order=${orderArr[1]}`);
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

const deletePostLike = async (postLike: PostLike) => {
    const response = await axiosInstance.delete(route + postLike.id + "?like_type=" + postLike.likeType);
    return response.data;
};

export { readPostsLikes, readPostLikes, createPostLike, deletePostLike };
