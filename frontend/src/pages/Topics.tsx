import TopicItem from "../components/TopicItem";
import Topic from "../types/Topic";
import { readTopics } from "../api/topic";
import { useCreateTopic } from "../hooks/topics";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress, Link, Snackbar, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TopicIcon from "@mui/icons-material/Topic";

const Topics: React.FC = () => {
    const [newTitle, setNewTitle] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [snackBar, setSnackBar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
    const { isLoading, isError, data } = useQuery({
        queryKey: ["topics"],
        queryFn: readTopics,
    });

    const createTopicMutation = useCreateTopic();
    const handleSnackBarClose = () => setSnackBar({ open: false, message: "" });
    const showSnackBar = (message: string) => {
        setSnackBar({ open: true, message });
    };

    const handleCreate = () => setIsCreating(true);
    const handleConfirm = () => {
        if (newTitle == "") {
            showSnackBar("Title must not be empty!");
            return;
        }
        createTopicMutation.mutate(newTitle, {
            onSuccess: () => {
                setIsCreating(false);
                setNewTitle("");
                showSnackBar("Topic created successfully!");
            },
            onError: () => {
                showSnackBar("Failed to create topic.");
            },
        });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setNewTitle("");
    };

    const isSubmitting = createTopicMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Topics <TopicIcon />
            </Typography>

            {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading topics.
                </Alert>
            )}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {data == null && <Typography>No topics yet.</Typography>}

                {data?.map((topic: Topic) => (
                    <TopicItem key={topic.id} topic={topic} />
                ))}
                <Button onClick={handleCreate} disabled={isLoading} variant="outlined">
                    Create topic
                </Button>
                {isCreating && (
                    <>
                        <Typography>New topic name</Typography>
                        <TextField
                            value={newTitle}
                            required
                            label="Title"
                            disabled={isSubmitting}
                            aria-label="Title"
                            onChange={(event) => setNewTitle(event.target.value)}
                        />
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button onClick={handleCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                startIcon={isSubmitting && <CircularProgress size={16} />}
                            >
                                {isSubmitting ? "Creating..." : "Confirm"}
                            </Button>
                        </Box>
                    </>
                )}
                <Link component={RouterLink} to="/" underline="hover">
                    Back to home page
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

export default Topics;
