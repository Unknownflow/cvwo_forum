import EditModeAction from "./EditModeAction";
import ViewModeAction from "./ViewModeAction";
import Post from "../types/Post";
import { useDeletePost, useUpdatePost } from "../hooks/posts";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import React, { useState } from "react";
import { Box, Card, CardActionArea, CardActions, CardContent, Snackbar, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
    post: Post;
    topicID: string;
};

const PostItem: React.FC<Props> = ({ post, topicID }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedPost, setEditedPost] = useState<{ header: string; body: string }>({ header: "", body: "" });
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const navigate = useNavigate();
    const updatePostMutation = useUpdatePost(topicID);
    const deletePostMutation = useDeletePost(topicID);
    const { user } = useUser();
    const isEditable = post.author == user;

    const handleNavigate = () => {
        navigate("/topics/" + topicID + "/posts/" + post.id + "/comments");
    };

    const handleConfirmEdit = () => {
        const trimmedHeader = editedPost.header.trim();
        const trimmedBody = editedPost.body.trim();

        if (!trimmedHeader || !trimmedBody) {
            showSnackBar("Header and body must not be empty!");
            return;
        }

        const updatedPost: Post = { ...post, body: trimmedBody, header: trimmedHeader };

        updatePostMutation.mutate(updatedPost, {
            onSuccess: () => {
                setIsEditing(false);
                showSnackBar("Post updated successfully!");
            },
            onError: () => {
                showSnackBar("Failed to update post.");
            },
        });
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditedPost({ header: post.header, body: post.body });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedPost({ header: "", body: "" });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            deletePostMutation.mutate(post.id, {
                onSuccess: () => {
                    showSnackBar("Post deleted successfully!");
                },
                onError: () => {
                    showSnackBar("Failed to delete post");
                },
            });
        }
    };

    const isLoading = updatePostMutation.isPending || deletePostMutation.isPending;

    return (
        <Card key={post.id}>
            <Box
                sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}
            >
                {isEditing ? (
                    <CardContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                value={editedPost.header}
                                required
                                label="Header"
                                disabled={isLoading}
                                aria-label="Post header"
                                onChange={(event) => setEditedPost({ ...editedPost, header: event.target.value })}
                            />
                            <TextField
                                value={editedPost.body}
                                required
                                label="Body"
                                disabled={isLoading}
                                aria-label="Post body"
                                multiline
                                rows={4}
                                onChange={(event) => setEditedPost({ ...editedPost, body: event.target.value })}
                            />
                        </Box>
                    </CardContent>
                ) : (
                    <CardActionArea onClick={handleNavigate}>
                        <CardContent>
                            <Typography variant="h6" color="textPrimary" component="p" fontWeight="bold">
                                {post.header}
                            </Typography>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {post.body}
                            </Typography>
                            <Typography variant="body2" color="textPrimary" component="p">
                                By {post.author}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                )}

                {isEditable && (
                    <CardActions>
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
                                isPending={deletePostMutation.isPending}
                                type="post"
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

export default PostItem;
