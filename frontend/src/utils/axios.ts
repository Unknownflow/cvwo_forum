/* eslint-disable import/no-named-as-default-member */
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log("response", response);
        return response;
    },
    (error) => {
        if (axios.isAxiosError(error)) {
            // Handle 401 Unauthorized globally
            if (error.response?.status === 401) {
                console.log("Unauthorized - redirecting to login");
            }

            // Extract error message from response
            const message = error.response?.data;
            console.error("API Error:", message);

            return Promise.reject(new Error(message));
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
