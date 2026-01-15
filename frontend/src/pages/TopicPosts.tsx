import Post, { PostRequest } from "../types/Post";
import PostItem from "../components/PostItem";
import { readTopic, readTopicPosts } from "../api/topic";
import { useCreatePost } from "../hooks/posts";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import TopicItem from "../components/TopicItem";
import modalStyle from "../styles/ModalStyle";
import ModalActions from "../components/ModalActions";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import SortOrder, { DEFAULT_SORT_ORDER } from "../types/SortOrder";
import SortButton from "../components/SortButton";
import SearchBox from "../components/SearchBox";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Fab, Snackbar, Stack, TextField, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useParams, useNavigate } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import AddIcon from "@mui/icons-material/Add";

const TopicPosts: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const topicID = Number(id);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [order, setOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const { user } = useUser();
    const [newPostRequest, setNewPostRequest] = useState<PostRequest>({
        header: "",
        body: "",
        author: user,
        topicID: topicID,
    });
    const {
        isLoading: isPostLoading,
        isError: isPostError,
        data: postsData,
    } = useQuery({
        queryKey: ["topicPosts", topicID, order, searchTerm],
        queryFn: () => readTopicPosts(topicID, order, searchTerm),
        enabled: !!id,
    });
    const {
        isLoading: isTopicLoading,
        isError: isTopicError,
        data: topicData,
    } = useQuery({
        queryKey: ["topic", topicID],
        queryFn: () => readTopic(topicID),
    });

    const resetForm = () => {
        setNewPostRequest({
            header: "",
            body: "",
            author: user,
            topicID: topicID,
        });
    };
    const createPostMutation = useCreatePost(topicID, order);
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

    const handleTopics = () => {
        navigate("/topics");
    };

    const isSubmitting = createPostMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Posts <ArticleIcon />
            </Typography>

            {isTopicLoading && isPostLoading && <LoadingDisplay />}
            {isTopicError && <ErrorDisplay type="topics" />}
            {isPostError && <ErrorDisplay type="posts" />}

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
                    <Box sx={{ mb: 1, width: "100%" }}>
                        <TopicItem topic={topicData} editable={false} />
                    </Box>
                )}

                <Stack direction="row" spacing={3} sx={{ width: "100%" }}>
                    <SortButton order={order} setOrder={setOrder} />
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} type="posts" />
                </Stack>

                {!isPostError && !isPostLoading && postsData == null && <Typography>No posts found.</Typography>}

                {postsData?.map((post: Post) => (
                    <PostItem key={post.id} post={post} editable={true} />
                ))}

                <Fab
                    color="primary"
                    aria-label="create-post"
                    onClick={handleModalOpen}
                    sx={{ position: "fixed", bottom: 24, right: 24 }}
                >
                    <AddIcon />
                </Fab>

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

                <Button variant="contained" onClick={handleTopics}>
                    Back to Topics
                </Button>

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
