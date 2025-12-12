import TopicItem from "../components/TopicItem";
import Topic from "../types/Topic";
import { queryClient } from "../App";
import { createTopic, readTopics } from "../api/topic";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Box, Button, Link, Snackbar, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Topics: React.FC = () => {
    const [newTitle, setNewTitle] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
    const [snackBarMessage, setSnackBarMessage] = useState<string>("");
    const { isLoading, isError, data } = useQuery({
        queryKey: ["topics"],
        queryFn: readTopics,
    });

    const handleCreate = () => setIsCreating(true);
    const handleConfirm = () => {
        if (newTitle == "") {
            setSnackBarMessage("Title must not be empty!");
            setIsSnackBarOpen(true);
            return;
        }
        mutation.mutate(newTitle);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setNewTitle("");
    };

    const handleSnackBarClose = () => setIsSnackBarOpen(false);

    const mutation = useMutation({
        mutationFn: createTopic,
        onMutate: async (title: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prevd value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically add the new topic with a temporary ID
            const optimisticTopic = {
                title: title,
                id: -Date.now(),
            };

            queryClient.setQueryData<Topic[]>(["topics"], (old) => [...(old ?? []), optimisticTopic]);

            // Return context for rollback
            return { previousTopics };
        },
        onSuccess: () => {
            setIsCreating(false);
            setNewTitle("");
        },
        onError: (error, newTopic, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });

    return (
        <div>
            <h1>Topics</h1>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error loading...</div>}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {data && data.map((topic: Topic) => <TopicItem key={topic.id} topic={topic} />)}
                <Button onClick={handleCreate}>Create topic</Button>
                {isCreating && (
                    <>
                        <Typography>New topic name</Typography>
                        <TextField
                            value={newTitle}
                            label="Title"
                            required
                            onChange={(event) => setNewTitle(event.target.value)}
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button size="small" onClick={handleConfirm}>
                                Confirm
                            </Button>
                            <Button size="small" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Box>
                    </>
                )}
                <Link component={RouterLink} to="/">
                    Back to home page
                </Link>
                <Snackbar
                    open={isSnackBarOpen}
                    autoHideDuration={2000}
                    onClose={handleSnackBarClose}
                    message={snackBarMessage}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                />
            </Box>
        </div>
    );
};

export default Topics;
