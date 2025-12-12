import Topic from "../types/Topic";
import { deleteTopic, updateTopic } from "../api/topic";
import { queryClient } from "../App";
import React, { useState } from "react";
import { Box, Button, Card, CardActions, CardContent, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@tanstack/react-query";

type Props = {
    topic: Topic;
};

const TopicItem: React.FC<Props> = ({ topic }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newTitle, setNewTitle] = useState<string>("");

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

    return (
        <Card key={topic.id}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CardContent>
                    {isEditing ? (
                        <TextField value={newTitle} onChange={(event) => setNewTitle(event.target.value)}></TextField>
                    ) : (
                        <Typography variant="body1" color="textPrimary" component="p">
                            {topic.title}
                        </Typography>
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
        </Card>
    );
};

export default TopicItem;
