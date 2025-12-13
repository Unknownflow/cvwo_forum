import Comment from "../types/Comment";
import CommentRequest from "../types/CommentRequest";

import axios from "axios";

const addr = process.env.REACT_APP_API_BASE_URL + "/comments/";

const readComments = async () => {
    const response = await axios.get(addr);
    return response.data;
};

const readComment = async (id: number) => {
    const response = await axios.get(addr + id);
    return response.data;
};

const createComment = async (newComment: CommentRequest) => {
    const response = await axios.post(addr, newComment);
    return response.data;
};

const updateComment = async (newComment: Comment) => {
    const response = await axios.put(addr + newComment.id, newComment);
    return response.data;
};

const deleteComment = async (id: number) => {
    const response = await axios.delete(addr + id);
    return response.data;
};

export { readComments, readComment, createComment, updateComment, deleteComment };
