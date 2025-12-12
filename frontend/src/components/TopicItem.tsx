import Topic from "../types/Topic";
import { deleteTopic, updateTopic } from "../api/topic";
import { queryClient } from "../App";
import React, { useState } from "react";
import { Box, Button, Card, CardActions, CardContent, Snackbar, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type Props = {
    topic: Topic;
};

const TopicItem: React.FC<Props> = ({ topic }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newTitle, setNewTitle] = useState<string>("");
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
    const [snackBarMessage, setSnackBarMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/topics/" + topic.id + "/posts");
    };

    const updateTopicItem = useMutation({
        mutationFn: updateTopic,
        // Optimistically update UI before server responds
        onMutate: async (updatedTopic: Topic) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically update topic in list
            queryClient.setQueryData<Topic[]>(
                ["topics"],
                (old) => old?.map((t) => (t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedTopic, context) => {
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });

    const deleteTopicItem = useMutation({
        mutationFn: deleteTopic,
        // Optimistically update UI before server responds
        onMutate: async (topicId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically update by removing topic
            queryClient.setQueryData<Topic[]>(["topics"], (old) => old?.filter((t) => t.id !== topicId) ?? []);

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, topicId, context) => {
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });

    const handleConfirmEdit = () => {
        if (newTitle == "") {
            setSnackBarMessage("Title must not be empty!");
            setIsSnackBarOpen(true);
            return;
        }
        setIsEditing(false);
        topic.title = newTitle;
        updateTopicItem.mutate(topic);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setNewTitle(topic.title);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleDelete = () => deleteTopicItem.mutate(topic.id);
    const handleSnackBarClose = () => setIsSnackBarOpen(false);

    return (
        <Card key={topic.id}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CardContent>
                    {isEditing ? (
                        <TextField
                            value={newTitle}
                            required
                            label="Title"
                            onChange={(event) => setNewTitle(event.target.value)}
                        ></TextField>
                    ) : (
                        <Typography variant="body1" color="textPrimary" component="p">
                            {topic.title}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={handleNavigate}>
                        View posts
                    </Button>
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

export default TopicItem;
