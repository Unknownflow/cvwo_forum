import { useUser } from "../context/userContext";
import { useLogoutUser } from "../hooks/users";
import React from "react";
import { AppBar, Box, Button, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { HomeFilled } from "@mui/icons-material";
import TopicIcon from "@mui/icons-material/Topic";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NavBar: React.FC = () => {
    const { user, logout } = useUser();
    const logoutMutation = useLogoutUser();
    const navigate = useNavigate();

    const handleHome = () => {
        navigate("/");
    };

    const handleTopics = () => {
        navigate("/topics");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLikes = () => {
        navigate("/likes");
    };

    const handleProfile = () => {
        navigate("/users/" + user);
    };

    const handleLogout = () => {
        logoutMutation.mutate();
        logout();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "align-left", gap: 2 }}>
                        <Button color="inherit" onClick={user == "" ? handleHome : handleTopics}>
                            <HomeFilled />
                            &nbsp;Home
                        </Button>
                        <Button color="inherit" onClick={handleTopics}>
                            <TopicIcon />
                            &nbsp;Topics
                        </Button>
                        <Button color="inherit" onClick={handleLikes}>
                            <FavoriteBorderIcon />
                            &nbsp;Likes
                        </Button>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {user != "" && (
                            <Button color="inherit" onClick={handleProfile}>
                                <AccountCircleIcon />
                                &nbsp;Profile
                            </Button>
                        )}
                        <Button color="inherit" onClick={() => (user ? handleLogout() : handleLogin())}>
                            {user == "" ? (
                                <>
                                    <LoginIcon />
                                    &nbsp;Log in
                                </>
                            ) : (
                                <>
                                    <LogoutIcon />
                                    &nbsp;Log out
                                </>
                            )}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default NavBar;
