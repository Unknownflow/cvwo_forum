import { useUser } from "../context/userContext";
import { readPostsLikes } from "../api/postLikes";
import PostItem from "../components/PostItem";
import Post from "../types/Post";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const Likes: React.FC = () => {
    const { user } = useUser();

    const { isLoading, isError, data } = useQuery({
        queryKey: ["postLikes", user],
        queryFn: readPostsLikes,
    });

    console.log("data", data);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="h1" gutterBottom>
                Liked Posts
            </Typography>
            {isError && <>Error loading</>}
            {isLoading && <>Currently loading</>}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mx: "auto",
                    gap: 2,
                    maxWidth: 800,
                }}
            >
                {!isLoading &&
                    !isError &&
                    data?.map((post: Post) => (
                        <PostItem key={post.id} post={post} topicID={post.topic_id.toString()} editable={true} />
                    ))}
            </Box>
        </Box>
    );
};

export default Likes;
