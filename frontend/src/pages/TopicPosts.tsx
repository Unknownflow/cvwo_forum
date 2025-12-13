import Post from "../types/Post";
import PostRequest from "../types/PostRequest";
import PostItem from "../components/PostItem";
import { readTopicPosts } from "../api/topic";
import { useCreatePost } from "../hooks/posts";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress, Link, Snackbar, TextField, Typography } from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";

const TopicPosts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const topicId = id ?? "";
    const topicIdNumber = Number(topicId);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [snackBar, setSnackBar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
    const [newPostRequest, setNewPostRequest] = useState<PostRequest>({
        header: "",
        body: "",
        author: "username", // TODO: update to indiv username
        topic_id: topicIdNumber,
    });
    const { isLoading, isError, data } = useQuery({
        queryKey: ["topicPosts", id],
        queryFn: () => readTopicPosts(topicIdNumber),
        enabled: !!topicId,
    });

    const resetForm = () => {
        setNewPostRequest({
            header: "",
            body: "",
            author: "username",
            topic_id: topicIdNumber,
        });
    };
    const createPostMutation = useCreatePost(topicId);
    const handleCreate = () => setIsCreating(true);
    const handleConfirm = () => {
        const trimmedHeader = newPostRequest.header.trim();
        const trimmedBody = newPostRequest.body.trim();

        if (!trimmedHeader || !trimmedBody) {
            showSnackBar("Header and body must not be empty!");
            return;
        }
        const newPost: PostRequest = { ...newPostRequest, body: trimmedBody, header: trimmedHeader };
        createPostMutation.mutate(newPost, {
            onSuccess: () => {
                resetForm();
                setIsCreating(false);
                showSnackBar("Post created successfully!");
            },
            onError: () => {
                showSnackBar("Failed to create post.");
            },
        });
    };

    const handleSnackBarClose = () => setSnackBar({ open: false, message: "" });
    const showSnackBar = (message: string) => {
        setSnackBar({ open: true, message });
    };

    const handleCancel = () => {
        setIsCreating(false);
        resetForm();
    };

    const isSubmitting = createPostMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Posts <ArticleIcon />
            </Typography>

            {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading posts.
                </Alert>
            )}

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
                {data == null && <Typography>No posts yet.</Typography>}

                {data?.map((post: Post) => (
                    <PostItem key={post.id} topicID={id ? id : ""} post={post} />
                ))}
                <Button onClick={handleCreate} disabled={isLoading}>
                    Create post
                </Button>

                {isCreating && (
                    <>
                        <Typography>Create new post</Typography>
                        <TextField
                            value={newPostRequest.header}
                            required
                            label="Header"
                            disabled={isSubmitting}
                            aria-label="Post header"
                            onChange={(event) => setNewPostRequest({ ...newPostRequest, header: event.target.value })}
                        />
                        <TextField
                            value={newPostRequest.body}
                            required
                            label="Body"
                            disabled={isSubmitting}
                            aria-label="Post body"
                            multiline
                            rows={4}
                            onChange={(event) => setNewPostRequest({ ...newPostRequest, body: event.target.value })}
                        />
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button onClick={handleCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                startIcon={isSubmitting && <CircularProgress size={16} />}
                            >
                                {isSubmitting ? "Creating..." : "Confirm"}
                            </Button>
                        </Box>
                    </>
                )}
                <Link component={RouterLink} to="/topics" underline="hover">
                    Back to topics page
                </Link>
                <Snackbar
                    open={snackBar.open}
                    autoHideDuration={2500}
                    onClose={handleSnackBarClose}
                    message={snackBar.message}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                />
            </Box>
        </Box>
    );
};

export default TopicPosts;
