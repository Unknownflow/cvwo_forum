import CommentLike from "../types/CommentLike";
import axiosInstance from "../utils/axios";

const route = "/comments/likes/";

const readCommentsLikes = async () => {
    const response = await axiosInstance.get(route);
    return response.data;
};

const readCommentLikes = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    return response.data;
};

const createCommentLike = async (newCommentLike: CommentLike) => {
    const response = await axiosInstance.post(route, newCommentLike);
    return response.data;
};

const deleteCommentLike = async (id: number) => {
    const response = await axiosInstance.delete(route + id);
    return response.data;
};

const readCommentLikesCount = async (id: number) => {
    const response = await axiosInstance.get(route + id + "/count");
    return response.data;
};

export { readCommentsLikes, readCommentLikes, createCommentLike, deleteCommentLike, readCommentLikesCount };
