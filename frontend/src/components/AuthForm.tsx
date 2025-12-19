import User from "../types/User";
import { capitalizeFirstLetter } from "../utils/utils";
import useSnackBar from "../hooks/useSnackBar";
import { useUser } from "../context/userContext";
import React, { FormEvent, useState } from "react";
import { Box, Button, CircularProgress, Snackbar, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UseMutationResult } from "@tanstack/react-query";

type Props = {
    mutation: UseMutationResult<unknown, Error, User, unknown>;
    label: string;
};

const AuthForm: React.FC<Props> = ({ mutation, label }) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const { login } = useUser();

    const resetForm = () => {
        setPassword("");
        setUsername("");
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username || !password) {
            showSnackBar("Please enter both username and password");
            return;
        }

        mutation.mutate(
            { username, password },
            {
                onSuccess: () => {
                    resetForm();
                    navigate("/topics");
                    login(username);
                },
                onError: (error) => {
                    showSnackBar(error.message);
                },
            },
        );
    };

    const isLoading = mutation.isPending;

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {capitalizeFirstLetter(label)}
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 1 }}
            >
                <TextField
                    value={username}
                    label="Username"
                    placeholder="Enter username"
                    required
                    disabled={isLoading}
                    aria-label="Enter username"
                    onChange={(event) => setUsername(event.target.value)}
                />
                <TextField
                    value={password}
                    label="Password"
                    placeholder="Enter password"
                    required
                    disabled={isLoading}
                    aria-label="Enter password"
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading && <CircularProgress size={16} color="inherit" />}
                >
                    {mutation.isPending ? "Loading..." : label}
                </Button>
            </Box>
            <Snackbar
                open={snackBar.open}
                autoHideDuration={2500}
                message={snackBar.message}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </>
    );
};

export default AuthForm;
