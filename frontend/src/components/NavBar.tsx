import { useUser } from "../context/userContext";
import { useLogoutUser } from "../hooks/users";
import React from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { HomeFilled } from "@mui/icons-material";

const NavBar: React.FC = () => {
    const { user, logout } = useUser();
    const logoutMutation = useLogoutUser();
    const navigate = useNavigate();

    const handleHome = () => {
        navigate("/");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        logoutMutation.mutate();
        logout();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                        onClick={handleHome}
                    >
                        <HomeFilled />
                        &nbsp;Home
                    </Typography>
                    <Button color="inherit" onClick={() => (user ? handleLogout() : handleLogin())}>
                        {user == "" ? "Log in" : "Log out"}
                    </Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default NavBar;
