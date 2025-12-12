import Topic from "../types/Topic";
import axios from "axios";

const addr = process.env.REACT_APP_API_BASE_URL + "/topics/";

const readTopics = async () => {
    const response = await axios.get(addr);
    return response.data;
};

const readTopic = async (id: number) => {
    const response = await axios.get(addr + id);
    return response.data;
};

const readTopicPosts = async (id: number) => {
    const response = await axios.get(addr + id + "/posts");
    return response.data;
};

const createTopic = async (title: string) => {
    const response = await axios.post(addr, { title });
    return response.data;
};

const updateTopic = async (newTopicData: Topic) => {
    const response = await axios.put(addr + newTopicData.id, newTopicData);
    return response.data;
};

const deleteTopic = async (id: number) => {
    const response = await axios.delete(addr + id);
    return response.data;
};

export { readTopics, readTopic, readTopicPosts, createTopic, updateTopic, deleteTopic };
