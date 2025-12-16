import Topic from "../types/Topic";
import useSnackBar from "../hooks/useSnackBar";
import { useDeleteTopic, useUpdateTopic } from "../hooks/topics";
import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardActionArea,
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
import { useNavigate } from "react-router-dom";

type Props = {
    topic: Topic;
};

const TopicItem: React.FC<Props> = ({ topic }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newTitle, setNewTitle] = useState<string>("");
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const navigate = useNavigate();
    const updateTopicMutation = useUpdateTopic();
    const deleteTopicMutation = useDeleteTopic();

    const handleNavigate = () => {
        navigate("/topics/" + topic.id + "/posts");
    };

    const handleConfirmEdit = () => {
        if (newTitle == "") {
            showSnackBar("Title must not be empty!");
            return;
        }
        setIsEditing(false);
        const newTopic: Topic = {
            ...topic,
            title: newTitle,
        };
        updateTopicMutation.mutate(newTopic, {
            onSuccess: () => {
                showSnackBar("Successfully updated topic!");
            },
            onError: () => {
                showSnackBar("Failed to update topic.");
            },
        });
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setNewTitle(topic.title);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteTopicMutation.mutate(topic.id, {
            onSuccess: () => {
                showSnackBar("Successfully deleted topic!");
            },
            onError: () => {
                showSnackBar("Failed to delete topic.");
            },
        });
    };

    const isLoading = updateTopicMutation.isPending || deleteTopicMutation.isPending;

    return (
        <Card key={topic.id} sx={{ width: "100%", maxWidth: 600, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                {isEditing ? (
                    <CardContent sx={{ display: "flex", flexGrow: 1 }}>
                        <TextField
                            value={newTitle}
                            required
                            fullWidth
                            label="Title"
                            disabled={isLoading}
                            aria-label="Title"
                            onChange={(event) => setNewTitle(event.target.value)}
                        />
                    </CardContent>
                ) : (
                    <CardActionArea onClick={handleNavigate} sx={{ display: "flex", justifyContent: "left" }}>
                        <CardContent>
                            <Typography noWrap variant="body1" color="textPrimary" component="p">
                                {topic.title}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                )}
                <CardActions>
                    {isEditing ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={handleConfirmEdit}
                                disabled={isLoading}
                                startIcon={isLoading && <CircularProgress size={16} />}
                                aria-label="Confirm edit"
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
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
                                aria-label="Edit topic"
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleDelete}
                                disabled={isLoading}
                                aria-label="Delete topic"
                            >
                                {deleteTopicMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
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

export default TopicItem;
