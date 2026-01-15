import PrivateRoutes from "./PrivateRoutes";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Topics from "../pages/Topics";
import TopicPosts from "../pages/TopicPosts";
import PostComments from "../pages/PostComments";
import Likes from "../pages/Likes";
import PageNotFound from "../pages/PageNotFound";
import UserProfile from "../pages/UserProfile";
import { Route, Routes } from "react-router-dom";
import React from "react";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoutes />}>
                <Route path="/users/:user" element={<UserProfile />} />
                <Route path="/likes" element={<Likes />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/:id/posts" element={<TopicPosts />} />
                <Route path="/topics/:topicID/posts/:postID/comments" element={<PostComments />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default AppRoutes;
