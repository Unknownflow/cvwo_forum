import EditModeAction from "./EditModeAction";
import ViewModeAction from "./ViewModeAction";
import CommentLikeAction from "./CommentLikeAction";
import ErrorDisplay from "./ErrorDisplay";
import Comment from "../types/Comment";
import { useDeleteComment, useUpdateComment } from "../hooks/comments";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import { formatDateTime } from "../utils/utils";
import React, { useState } from "react";
import { Box, Card, CardActions, CardContent, Snackbar, TextField, Typography } from "@mui/material";

type Props = {
    comment: Comment;
};

const CommentItem: React.FC<Props> = ({ comment }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedComment, setEditedComment] = useState<{ body: string }>({ body: "" });
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const updateCommentMutation = useUpdateComment(comment.postID);
    const deleteCommentMutation = useDeleteComment(comment.postID);
    const { user } = useUser();
    const isEditable = comment.author == user;

    const handleConfirmEdit = () => {
        const trimmedBody = editedComment.body.trim();

        if (!trimmedBody) {
            showSnackBar("Body must not be empty!");
            return;
        }

        const updatedComment: Comment = { ...comment, body: trimmedBody };

        updateCommentMutation.mutate(updatedComment, {
            onSuccess: () => {
                setIsEditing(false);
                showSnackBar("Comment updated successfully!");
            },
            onError: () => {
                showSnackBar("Failed to update comment.");
            },
        });
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditedComment({ body: comment.body });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedComment({ body: "" });
    };

    const handleDelete = () => {
        deleteCommentMutation.mutate(comment.id, {
            onSuccess: () => {
                showSnackBar("Comment deleted successfully!");
            },
            onError: () => {
                showSnackBar("Failed to delete comment");
            },
        });
    };

    const isLoading = updateCommentMutation.isPending || deleteCommentMutation.isPending;

    if (!comment) {
        return <ErrorDisplay type="comment" />;
    }

    return (
        <Card key={comment.id} sx={{ width: "100%", maxWidth: 800, borderRadius: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    textAlign: "left",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <CardContent sx={{ width: "100%" }}>
                    {isEditing ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                value={editedComment.body}
                                required
                                label="Body"
                                disabled={isLoading}
                                aria-label="Comment body"
                                multiline
                                rows={4}
                                onChange={(event) => setEditedComment({ ...editedComment, body: event.target.value })}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "left", wordBreak: "break-all" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="h6" color="textPrimary" component="p" fontWeight="bold">
                                    {comment.author} ·
                                </Typography>
                                <Typography variant="body1" color="text.secondary" component="p">
                                    &nbsp;{formatDateTime(comment.createdAt)}
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {comment.body}
                            </Typography>
                        </Box>
                    )}
                </CardContent>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        px: 2,
                        py: 1,
                    }}
                >
                    <CommentLikeAction commentID={comment.id} postID={comment.postID} likesCount={comment.likesCount} />
                    {isEditable && (
                        <CardActions sx={{ flexShrink: 0, py: 0 }}>
                            {isEditing ? (
                                <EditModeAction
                                    handleCancelEdit={handleCancelEdit}
                                    handleConfirmEdit={handleConfirmEdit}
                                    isLoading={isLoading}
                                />
                            ) : (
                                <ViewModeAction
                                    handleStartEdit={handleStartEdit}
                                    handleDelete={handleDelete}
                                    isLoading={isLoading}
                                    isPending={deleteCommentMutation.isPending}
                                    type="comment"
                                />
                            )}
                        </CardActions>
                    )}
                </Box>
            </Box>
            <Snackbar
                open={snackBar.open}
                autoHideDuration={2500}
                onClose={handleSnackBarClose}
                message={snackBar.message}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Card>
    );
};

export default CommentItem;
