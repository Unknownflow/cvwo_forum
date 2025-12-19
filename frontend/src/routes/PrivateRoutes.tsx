import { useUser } from "../context/userContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
    const { user } = useUser();
    return user != "" ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
