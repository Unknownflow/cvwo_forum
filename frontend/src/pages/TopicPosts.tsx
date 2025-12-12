import Post from "../types/Post";
import PostRequest from "../types/PostRequest";
import PostItem from "../components/PostItem";
import { queryClient } from "../App";
import { createPost } from "../api/post";
import { readTopicPosts } from "../api/topic";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Box, Button, Link, Snackbar, TextField, Typography } from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";

const TopicPosts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
    const [snackBarMessage, setSnackBarMessage] = useState<string>("");
    const [newPostRequest, setNewPostRequest] = useState<PostRequest>({
        header: "",
        body: "",
        author: "username", // to update to indiv username
        topic_id: Number(id),
    });
    const { isLoading, isError, data } = useQuery({
        queryKey: ["topicPosts", id],
        queryFn: () => readTopicPosts(Number(id)),
    });

    const handleCreate = () => setIsCreating(true);
    const handleConfirm = () => {
        if (newPostRequest.header == "" || newPostRequest.body == "") {
            setSnackBarMessage("Header and body must not be empty!");
            setIsSnackBarOpen(true);
            return;
        }
        mutation.mutate(newPostRequest);
    };

    const handleSnackBarClose = () => setIsSnackBarOpen(false);

    const handleCancel = () => {
        setIsCreating(false);
        setNewPostRequest({
            header: "",
            body: "",
            author: "username",
            topic_id: Number(id),
        });
    };

    const mutation = useMutation({
        mutationFn: createPost,
        onMutate: async (post: PostRequest) => {
            // Cancel any outgoing refetches
            console.log(Number(id));

            await queryClient.cancelQueries({ queryKey: ["topicPosts", id] });

            // Snapshot prevd value
            const previousPosts = queryClient.getQueryData<Post[]>(["posts", id]);

            const optimisticPost = { ...post, id: -Date.now(), createdAt: new Date().toISOString() };
            console.log("optimsitic", optimisticPost);

            queryClient.setQueryData<Post[]>(["posts", id], (old) => [...(old ?? []), optimisticPost]);

            // Return context for rollback
            return { previousPosts };
        },
        onSuccess: () => {
            setNewPostRequest({
                header: "",
                body: "",
                author: "username",
                topic_id: Number(id),
            });
            setIsCreating(false);
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["posts", id], context?.previousPosts);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["topicPosts", id] });
        },
    });

    return (
        <div>
            <h1>Posts</h1>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error loading...</div>}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {data && data.map((post: Post) => <PostItem key={post.id} topicID={id ? id : ""} post={post} />)}
                <Button onClick={handleCreate}>Create post</Button>
                {isCreating && (
                    <>
                        <Typography>Create new post</Typography>
                        <TextField
                            value={newPostRequest.header}
                            required
                            label="Header"
                            onChange={(event) => setNewPostRequest({ ...newPostRequest, header: event.target.value })}
                        />
                        <TextField
                            value={newPostRequest.body}
                            required
                            label="Body"
                            onChange={(event) => setNewPostRequest({ ...newPostRequest, body: event.target.value })}
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button size="small" onClick={handleConfirm}>
                                Confirm
                            </Button>
                            <Button size="small" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Box>
                    </>
                )}
                <Link component={RouterLink} to="/topics">
                    Back to topics page
                </Link>
                <Snackbar
                    open={isSnackBarOpen}
                    autoHideDuration={2000}
                    onClose={handleSnackBarClose}
                    message={snackBarMessage}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                />
            </Box>
        </div>
    );
};

export default TopicPosts;
