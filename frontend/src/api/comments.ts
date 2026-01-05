import Comment, { CommentRequest } from "../types/Comment";
import axiosInstance from "../utils/axios";

const route = "/comments/";

const readComment = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    return response.data;
};

const createComment = async (newComment: CommentRequest) => {
    const response = await axiosInstance.post(route, newComment);
    return response.data;
};

const updateComment = async (newComment: Comment) => {
    const response = await axiosInstance.put(route + newComment.id, newComment);
    return response.data;
};

const deleteComment = async (id: number) => {
    const response = await axiosInstance.delete(route + id);
    return response.data;
};

export { readComment, createComment, updateComment, deleteComment };
