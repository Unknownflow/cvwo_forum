/* eslint-disable import/no-named-as-default-member */
import User from "../types/User";
import axios from "axios";

const addr = "http://localhost:8000";

const createUser = async (newUserData: User) => {
    try {
        const response = await axios.post(addr + "/users", newUserData);
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data);
        }
    }
};

const verifyUser = async (userData: User) => {
    try {
        const response = await axios.post(addr + "/auth/login", userData);
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data);
        }
    }
};

export { createUser, verifyUser };
