import Comment from "../types/Comment";
import { useDeleteComment, useUpdateComment } from "../hooks/comments";
import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    IconButton,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
    comment: Comment;
    postID: string;
};

const CommentItem: React.FC<Props> = ({ comment, postID }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedComment, setEditedComment] = useState<{ body: string }>({ body: "" });
    const [snackBar, setSnackBar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
    const updateCommentMutation = useUpdateComment(postID);
    const deleteCommentMutation = useDeleteComment(postID);

    const handleSnackBarClose = () => setSnackBar({ open: false, message: "" });
    const showSnackBar = (message: string) => {
        setSnackBar({ open: true, message });
    };

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
        <Card key={comment.id}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CardContent>
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
                        <>
                            <Typography variant="h6" color="textPrimary" component="p" fontWeight="bold">
                                {comment.author}
                            </Typography>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {comment.body}
                            </Typography>
                        </>
                    )}
                </CardContent>
                <CardActions>
                    {isEditing ? (
                        <>
                            <Button
                                size="small"
                                onClick={handleConfirmEdit}
                                disabled={isLoading}
                                startIcon={isLoading && <CircularProgress size={16} />}
                                aria-label="Confirm edit"
                            >
                                Confirm
                            </Button>
                            <Button
                                size="small"
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                aria-label="Cancel edit"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <IconButton
                                size="small"
                                onClick={handleStartEdit}
                                disabled={isLoading}
                                aria-label="Edit comment"
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleDelete}
                                disabled={isLoading}
                                aria-label="Delete comment"
                            >
                                {deleteCommentMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                        </>
                    )}
                </CardActions>
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
