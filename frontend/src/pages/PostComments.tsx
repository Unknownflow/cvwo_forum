import CommentRequest from "../types/CommentRequest";
import { readPost, readPostComments } from "../api/post";
import { useCreateComment } from "../hooks/comments";
import CommentItem from "../components/CommentItem";
import Comment from "../types/Comment";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import PostItem from "../components/PostItem";
import modalStyle from "../styles/ModalStyle";
import ModalActions from "../components/ModalActions";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import SortOrder from "../types/SortOrder";
import SortButton from "../components/SortButton";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Fab, Link, Snackbar, TextField, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import CommentIcon from "@mui/icons-material/Comment";
import AddIcon from "@mui/icons-material/Add";

const PostComments: React.FC = () => {
    const { topicID, postID } = useParams<{ topicID: string; postID: string }>();
    const postIDNumber = Number(postID);
    const topicIDNumber = Number(topicID);
    const prevPageLink = `/topics/${topicID}/posts`;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [order, setOrder] = useState<SortOrder>("likes_count, desc");
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const { user } = useUser();
    const [newCommentRequest, setNewCommentRequest] = useState<CommentRequest>({
        body: "",
        author: user,
        post_id: postIDNumber,
    });
    const {
        isLoading: isCommentsLoading,
        isError: isCommentsError,
        data: commentsData,
    } = useQuery({
        queryKey: ["postComments", postIDNumber, order],
        queryFn: () => readPostComments(postIDNumber, order),
        enabled: !!postID,
    });
    const {
        isLoading: isPostLoading,
        isError: isPostError,
        data: postData,
    } = useQuery({
        queryKey: ["posts", postIDNumber],
        queryFn: () => readPost(postIDNumber),
        enabled: !!postID,
    });

    const resetForm = () => {
        setNewCommentRequest({
            body: "",
            author: user,
            post_id: postIDNumber,
        });
    };

    const createCommentMutation = useCreateComment(postIDNumber, order);
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    const handleConfirm = () => {
        const trimmedBody = newCommentRequest.body.trim();

        if (!trimmedBody) {
            showSnackBar("Body must not be empty!");
            return;
        }

        const newComment: CommentRequest = { ...newCommentRequest, body: trimmedBody };
        createCommentMutation.mutate(newComment, {
            onSuccess: () => {
                resetForm();
                handleModalClose();
                showSnackBar("Comment created successfully!");
            },
            onError: () => {
                showSnackBar("Failed to create comment.");
            },
        });
    };

    const handleCancel = () => {
        handleModalClose();
        resetForm();
    };

    const isSubmitting = createCommentMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Comments <CommentIcon />
            </Typography>

            {isPostLoading && isCommentsLoading && <LoadingDisplay />}

            {isPostError && <ErrorDisplay type="posts" />}

            {isCommentsError && <ErrorDisplay type="comments" />}

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
                {!isPostLoading && !isPostError && (
                    <Box sx={{ mb: 1, width: "100%" }}>
                        <PostItem post={postData} topicID={topicIDNumber} editable={false} />
                    </Box>
                )}

                {!isCommentsError && !isCommentsLoading && commentsData == null && (
                    <Typography>No comments yet.</Typography>
                )}

                {commentsData != null && <SortButton order={order} setOrder={setOrder} />}

                {commentsData?.map((comment: Comment) => (
                    <CommentItem key={comment.id} postID={postIDNumber} comment={comment} />
                ))}

                <Fab
                    color="primary"
                    aria-label="create-comment"
                    onClick={handleModalOpen}
                    sx={{ position: "fixed", bottom: 24, right: 24 }}
                >
                    <AddIcon />
                </Fab>

                <Modal open={isModalOpen} onClose={handleModalClose}>
                    <Box sx={modalStyle}>
                        <Typography fontWeight="bold">Create new comment</Typography>
                        <TextField
                            value={newCommentRequest.body}
                            required
                            label="Body"
                            disabled={isSubmitting}
                            aria-label="Post body"
                            multiline
                            rows={4}
                            onChange={(event) =>
                                setNewCommentRequest({ ...newCommentRequest, body: event.target.value })
                            }
                        />
                        <ModalActions
                            handleConfirm={handleConfirm}
                            handleCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </Box>
                </Modal>

                <Link component={RouterLink} to={prevPageLink} underline="hover">
                    Back to Posts
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

export default PostComments;
