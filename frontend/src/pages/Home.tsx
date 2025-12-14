import { useVerifyUser } from "../hooks/users";
import useSnackBar from "../hooks/useSnackBar";
import { Box, Button, CircularProgress, Container, Link, Paper, Snackbar, TextField, Typography } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { snackBar, showSnackBar, handleSnackBarClose } = useSnackBar();
    const navigate = useNavigate();
    const verifyUserMutation = useVerifyUser();

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

        verifyUserMutation.mutate(
            { username, password },
            {
                onSuccess: () => {
                    resetForm();
                    navigate("/topics");
                },
                onError: () => {
                    showSnackBar("Failed to sign in. Try again.");
                },
            },
        );
    };

    const isLoading = verifyUserMutation.isPending;

    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Sign in
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
                        {verifyUserMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="body2" sx={{ mr: 1, mt: 0.25 }}>
                        Don&apos;t have an account?
                    </Typography>
                    <Link component={RouterLink} to="/register" underline="hover">
                        Sign up
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

export default Home;
