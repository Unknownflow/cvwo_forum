import Topic from "../types/Topic";
import axiosInstance from "../utils/axios";

const route = "/topics/";

const readTopics = async () => {
    const response = await axiosInstance.get(route);
    return response.data;
};

const readTopic = async (id: number) => {
    const response = await axiosInstance.get(route + id);
    return response.data;
};

const readTopicPosts = async (id: number) => {
    const response = await axiosInstance.get(route + id + "/posts");
    return response.data;
};

const createTopic = async (topic: Topic) => {
    const response = await axiosInstance.post(route, topic);
    return response.data;
};

const updateTopic = async (newTopicData: Topic) => {
    const response = await axiosInstance.put(route + newTopicData.id, newTopicData);
    return response.data;
};

const deleteTopic = async (id: number) => {
    const response = await axiosInstance.delete(route + id);
    return response.data;
};

export { readTopics, readTopic, readTopicPosts, createTopic, updateTopic, deleteTopic };
