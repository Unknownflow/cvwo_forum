import CommentLike from "../types/CommentLike";
import axiosInstance from "../utils/axios";

const route = "/comments/likes/";

const readCommentsLikes = async (order: string) => {
    const orderArr = order.split(", ");
    const response = await axiosInstance.get(`${route}?key=${orderArr[0]}&order=${orderArr[1]}`);
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

const deleteCommentLike = async (commentLike: CommentLike) => {
    const response = await axiosInstance.delete(route + commentLike.id + "?like_type=" + commentLike.likeType);
    return response.data;
};

export { readCommentsLikes, readCommentLikes, createCommentLike, deleteCommentLike };
