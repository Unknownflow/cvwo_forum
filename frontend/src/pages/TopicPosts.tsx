import Post from "../types/Post";
import PostRequest from "../types/PostRequest";
import PostItem from "../components/PostItem";
import { readTopic, readTopicPosts } from "../api/topic";
import { useCreatePost } from "../hooks/posts";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import TopicItem from "../components/TopicItem";
import modalStyle from "../styles/ModalStyle";
import ModalActions from "../components/ModalActions";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress, Link, Snackbar, TextField, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useParams, Link as RouterLink } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";

const TopicPosts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const topicId = id ?? "";
    const topicIdNumber = Number(topicId);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const { user } = useUser();
    const [newPostRequest, setNewPostRequest] = useState<PostRequest>({
        header: "",
        body: "",
        author: user,
        topic_id: topicIdNumber,
    });
    const {
        isLoading: isPostLoading,
        isError: isPostError,
        data: postsData,
    } = useQuery({
        queryKey: ["topicPosts", id],
        queryFn: () => readTopicPosts(topicIdNumber),
        enabled: !!topicId,
    });
    const {
        isLoading: isTopicLoading,
        isError: isTopicError,
        data: topicData,
    } = useQuery({
        queryKey: ["topic", topicIdNumber],
        queryFn: () => readTopic(topicIdNumber),
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
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

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
                handleModalClose();
                showSnackBar("Post created successfully!");
            },
            onError: () => {
                showSnackBar("Failed to create post.");
            },
        });
    };

    const handleCancel = () => {
        handleModalClose();
        resetForm();
    };

    const isSubmitting = createPostMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Posts <ArticleIcon />
            </Typography>

            {isTopicLoading && isPostLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {isTopicError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading topic.
                </Alert>
            )}

            {isPostError && (
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
                {!isTopicLoading && !isTopicError && (
                    <Box sx={{ mb: 3 }}>
                        <TopicItem topic={topicData} />
                    </Box>
                )}

                {!isPostError && !isPostLoading && postsData == null && <Typography>No posts yet.</Typography>}

                {postsData?.map((post: Post) => (
                    <PostItem key={post.id} topicID={id ? id : ""} post={post} />
                ))}
                <Button onClick={handleModalOpen} disabled={isPostLoading}>
                    Create post
                </Button>

                <Modal open={isModalOpen} onClose={handleModalClose}>
                    <Box sx={modalStyle}>
                        <Typography fontWeight="bold">Create new post</Typography>
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
                        <ModalActions
                            handleConfirm={handleConfirm}
                            handleCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </Box>
                </Modal>

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
