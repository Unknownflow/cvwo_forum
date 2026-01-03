import TopicItem from "../components/TopicItem";
import Topic, { TopicRequest } from "../types/Topic";
import { readTopics } from "../api/topic";
import { useCreateTopic } from "../hooks/topics";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import ModalActions from "../components/ModalActions";
import modalStyle from "../styles/ModalStyle";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Link, Snackbar, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TopicIcon from "@mui/icons-material/Topic";
import Modal from "@mui/material/Modal";

const Topics: React.FC = () => {
    const [newTitle, setNewTitle] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const createTopicMutation = useCreateTopic();
    const { user } = useUser();
    const { isLoading, isError, data } = useQuery({
        queryKey: ["topics"],
        queryFn: readTopics,
    });

    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    const handleConfirm = () => {
        if (newTitle == "") {
            showSnackBar("Title must not be empty!");
            return;
        }

        const topic: TopicRequest = { title: newTitle, author: user };
        createTopicMutation.mutate(topic, {
            onSuccess: () => {
                handleModalClose();
                setNewTitle("");
                showSnackBar("Topic created successfully!");
            },
            onError: () => {
                showSnackBar("Failed to create topic.");
            },
        });
    };

    const handleCancel = () => {
        handleModalClose();
        setNewTitle("");
    };

    const isSubmitting = createTopicMutation.isPending;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Topics <TopicIcon />
            </Typography>

            {isLoading && <LoadingDisplay />}
            {isError && <ErrorDisplay type="topics" />}

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
                    <TopicItem key={topic.id} topic={topic} editable={true} />
                ))}
                <Button onClick={handleModalOpen} disabled={isLoading} variant="outlined">
                    Create topic
                </Button>

                <Modal open={isModalOpen} onClose={handleModalClose}>
                    <Box sx={modalStyle}>
                        <Typography fontWeight="bold">New topic name</Typography>
                        <TextField
                            value={newTitle}
                            required
                            label="Title"
                            disabled={isSubmitting}
                            aria-label="Title"
                            onChange={(event) => setNewTitle(event.target.value)}
                        />
                        <ModalActions
                            handleConfirm={handleConfirm}
                            handleCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </Box>
                </Modal>

                <Link component={RouterLink} to="/" underline="hover">
                    Back to Home
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
