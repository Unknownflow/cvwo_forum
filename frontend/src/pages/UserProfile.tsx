import PostItem from "../components/PostItem";
import Post from "../types/Post";
import { readPostsByUser } from "../api/post";
import { Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useParams<{ user: string }>();
    console.log("user", user);

    const { isLoading, isError, data } = useQuery({
        queryKey: ["userPosts"],
        queryFn: () => readPostsByUser(user ? user : ""),
    });

    return (
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} padding={2}>
            <Typography variant="h4" component="h1" fontWeight="bold">
                {user}&apos;s posts
            </Typography>

            {!isError && !isLoading && data == null && <Typography>No posts found.</Typography>}
            {!isLoading &&
                !isError &&
                data?.map((post: Post) => (
                    <Stack sx={{ width: "800px" }} key={post.id}>
                        <Button
                            variant="contained"
                            sx={{ width: "fit-content", mb: 1 }}
                            onClick={() => navigate("/topics/" + post.topicID + "/posts")}
                        >
                            {post.title}
                        </Button>
                        <PostItem post={post} editable={true} />
                    </Stack>
                ))}
        </Stack>
    );
};

export default UserProfile;
