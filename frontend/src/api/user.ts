import User from "../types/User";
import axiosInstance from "../utils/axios";

const createUser = async (user: User) => {
    const response = await axiosInstance.post("/auth/signup", user);
    return response.data;
};

const verifyUser = async (user: User) => {
    const response = await axiosInstance.post("/auth/login", user);
    return response.data;
};

export { createUser, verifyUser };
