import EditModeAction from "./EditModeAction";
import ViewModeAction from "./ViewModeAction";
import Comment from "../types/Comment";
import { useDeleteComment, useUpdateComment } from "../hooks/comments";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import { formatDateTime } from "../utils/utils";
import React, { useState } from "react";
import { Box, Card, CardActions, CardContent, Snackbar, TextField, Typography } from "@mui/material";

type Props = {
    comment: Comment;
    postID: string;
};

const CommentItem: React.FC<Props> = ({ comment, postID }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedComment, setEditedComment] = useState<{ body: string }>({ body: "" });
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const updateCommentMutation = useUpdateComment(postID);
    const deleteCommentMutation = useDeleteComment(postID);
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
        if (window.confirm("Are you sure you want to delete this comment?")) {
            deleteCommentMutation.mutate(comment.id, {
                onSuccess: () => {
                    showSnackBar("Comment deleted successfully!");
                },
                onError: () => {
                    showSnackBar("Failed to delete comment");
                },
            });
        }
    };

    const isLoading = updateCommentMutation.isPending || deleteCommentMutation.isPending;

    return (
        <Card key={comment.id} sx={{ width: "100%", maxWidth: 800, borderRadius: 2 }}>
            <Box sx={{ display: "flex" }}>
                <CardContent sx={{ flex: 1 }}>
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
                                    &nbsp;{formatDateTime(comment.created_at)}
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {comment.body}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
                {isEditable && (
                    <CardActions sx={{ flexShrink: 0 }}>
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
