import Post from "../types/Post";
import { deletePost, updatePost } from "../api/post";
import { queryClient } from "../App";
import React, { useState } from "react";
import { Box, Button, Card, CardActions, CardContent, Snackbar, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@tanstack/react-query";

type Props = {
    post: Post;
    topicID: string;
};

const PostItem: React.FC<Props> = ({ post, topicID }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newBody, setNewBody] = useState<string>("");
    const [newHeader, setNewHeader] = useState<string>("");
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
    const [snackBarMessage, setSnackBarMessage] = useState<string>("");

    const updatePostItem = useMutation({
        mutationFn: updatePost,
        // Optimistically update UI before server responds
        onMutate: async (updatedPost: Post) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topicPosts", topicID] });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

            // Optimistically update post in list
            queryClient.setQueryData<Post[]>(
                ["posts"],
                (old) => old?.map((t) => (t.id === updatedPost.id ? { ...t, ...updatedPost } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousPosts };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedPost, context) => {
            queryClient.setQueryData(["posts"], context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
        },
    });

    const deletePostItem = useMutation({
        mutationFn: deletePost,
        // Optimistically update UI before server responds
        onMutate: async (postId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topicPosts", topicID] });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

            // Optimistically update by removing post
            queryClient.setQueryData<Post[]>(["posts"], (old) => old?.filter((t) => t.id !== postId) ?? []);

            // Return context with snapshot
            return { previousPosts };
        },
        // If mutation fails, rollback to prev value
        onError: (err, postId, context) => {
            queryClient.setQueryData(["posts"], context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
        },
    });

    const handleConfirmEdit = () => {
        if (newBody == "" || newHeader == "") {
            setSnackBarMessage("Header and body must not be empty!");
            setIsSnackBarOpen(true);
            return;
        }
        setIsEditing(false);
        post.body = newBody;
        post.header = newHeader;
        updatePostItem.mutate(post);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setNewBody(post.body);
        setNewHeader(post.header);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleDelete = () => deletePostItem.mutate(post.id);
    const handleSnackBarClose = () => setIsSnackBarOpen(false);

    return (
        <Card key={post.id}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CardContent>
                    {isEditing ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                value={newHeader}
                                required
                                label="Header"
                                onChange={(event) => setNewHeader(event.target.value)}
                            />
                            <TextField
                                value={newBody}
                                required
                                label="Body"
                                onChange={(event) => setNewBody(event.target.value)}
                            />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color="textPrimary" component="p" fontWeight="bold">
                                {post.header}
                            </Typography>
                            <Typography variant="body1" color="textPrimary" component="p">
                                {post.body}
                            </Typography>
                            <Typography variant="body2" color="textPrimary" component="p">
                                By {post.author}
                            </Typography>
                        </>
                    )}
                </CardContent>
                <CardActions>
                    {isEditing ? (
                        <>
                            <Button size="small" onClick={handleConfirmEdit}>
                                Confirm
                            </Button>
                            <Button size="small" onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button size="small" onClick={handleStartEdit}>
                            <EditIcon />
                        </Button>
                    )}

                    <Button size="small" onClick={handleDelete}>
                        <DeleteIcon />
                    </Button>
                </CardActions>
            </Box>
            <Snackbar
                open={isSnackBarOpen}
                autoHideDuration={2000}
                onClose={handleSnackBarClose}
                message={snackBarMessage}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Card>
    );
};

export default PostItem;
