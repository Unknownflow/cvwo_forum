import { useCreateUser } from "../hooks/users";
import { Box, Button, CircularProgress, Container, Link, Paper, Snackbar, TextField, Typography } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [snackBar, setSnackBar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
    const navigate = useNavigate();
    const createUserMutation = useCreateUser();

    const handleSnackBarClose = () => setSnackBar({ open: false, message: "" });
    const showSnackBar = (message: string) => {
        setSnackBar({ open: true, message });
    };

    const resetForm = () => {
        setUsername("");
        setPassword("");
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username || !password) {
            showSnackBar("Please enter both username and password");
            return;
        }

        createUserMutation.mutate(
            { username, password },
            {
                onSuccess: () => {
                    resetForm();
                    navigate("/topics");
                },
                onError: (err) => {
                    showSnackBar(err.message);
                },
            },
        );
    };

    const isLoading = createUserMutation.isPending;

    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Register for an account
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
                        {createUserMutation.isPending ? "Signing up..." : "Sign up"}
                    </Button>
                </Box>
                <Box>
                    <Link component={RouterLink} to="/" underline="hover">
                        Back to home
                    </Link>
                </Box>
            </Paper>
            <Snackbar
                open={snackBar.open}
                autoHideDuration={2500}
                message={snackBar.message}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Container>
    );
};

export default Register;
