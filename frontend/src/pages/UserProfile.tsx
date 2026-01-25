import PostItem from "../components/PostItem";
import Post from "../types/Post";
import { readPostsByUser } from "../api/post";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useParams<{ user: string }>();

    const { isLoading, isError, data } = useQuery({
        queryKey: ["userPosts", user],
        queryFn: () => readPostsByUser(user ? user : ""),
    });

    return (
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} padding={2}>
            <Typography variant="h4" component="h1">
                <AccountCircleIcon /> {user}&apos;s posts
            </Typography>

            {isLoading && <LoadingDisplay />}
            {isError && <ErrorDisplay type={user + " posts"} />}
            {!isError && !isLoading && data == null && <Typography>No posts found.</Typography>}

            {!isLoading &&
                !isError &&
                data?.map((post: Post) => (
                    <Stack key={post.id}>
                        <Button
                            variant="contained"
                            sx={{ width: "fit-content", mb: 1 }}
                            onClick={() => navigate("/topics/" + post.topicID + "/posts")}
                        >
                            {post.title}
                        </Button>
                        <PostItem post={post} editable={false} />
                    </Stack>
                ))}
        </Stack>
    );
};

export default UserProfile;
