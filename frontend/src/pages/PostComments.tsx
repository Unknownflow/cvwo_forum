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
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Link, Snackbar, TextField, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import CommentIcon from "@mui/icons-material/Comment";

const PostComments: React.FC = () => {
    const { topicID, postID } = useParams<{ topicID: string; postID: string }>();
    const postIdNumber = Number(postID);
    const prevPageLink = `/topics/${topicID}/posts`;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const { user } = useUser();
    const [newCommentRequest, setNewCommentRequest] = useState<CommentRequest>({
        body: "",
        author: user,
        post_id: postIdNumber,
    });
    const {
        isLoading: isCommentsLoading,
        isError: isCommentsError,
        data: commentsData,
    } = useQuery({
        queryKey: ["postComments", postID],
        queryFn: () => readPostComments(postIdNumber),
        enabled: !!postID,
    });
    const {
        isLoading: isPostLoading,
        isError: isPostError,
        data: postData,
    } = useQuery({
        queryKey: ["posts", postID],
        queryFn: () => readPost(postIdNumber),
        enabled: !!postID,
    });

    const resetForm = () => {
        setNewCommentRequest({
            body: "",
            author: user,
            post_id: postIdNumber,
        });
    };

    const createCommentMutation = useCreateComment(postID ? postID : "");
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    const handleConfirm = () => {
        const trimmedBody = newCommentRequest.body.trim();

        if (!trimmedBody) {
            showSnackBar("Body msut not be empty!");
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

            {isPostLoading && isCommentsLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {isPostError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading post.
                </Alert>
            )}

            {isCommentsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading comments.
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
                {!isPostLoading && !isPostError && (
                    <Box sx={{ mb: 3 }}>
                        <PostItem post={postData} topicID={topicID ? topicID : ""} editable={false} />
                    </Box>
                )}

                {!isCommentsError && !isCommentsLoading && commentsData == null && (
                    <Typography>No comments yet.</Typography>
                )}

                {commentsData?.map((comment: Comment) => (
                    <CommentItem key={comment.id} postID={postID ? postID : ""} comment={comment} />
                ))}
                <Button variant="outlined" onClick={handleModalOpen} disabled={isCommentsLoading}>
                    Create comment
                </Button>

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
