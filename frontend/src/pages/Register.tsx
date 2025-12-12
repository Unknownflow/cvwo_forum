import { createUser } from "../api/user";
import { queryClient } from "../App";
import { Box, Button, Container, Link, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setUsername("");
            setPassword("");
            navigate("/topics");
        },
        onError: (error) => {
            showSnackBar(error.message);
        },
    });

    const showSnackBar = (message: string) => {
        setIsSnackBarOpen(true);
        setMessage(message);
    };

    const handleSnackBarClose = () => setIsSnackBarOpen(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username || !password) {
            showSnackBar("please enter both username and password");
            return;
        }

        mutation.mutate({ username, password });
    };

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
                        placeholder="Enter username"
                        required
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <TextField
                        placeholder="Enter password"
                        required
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <Button type="submit" variant="contained">
                        {mutation.isPending ? "Signing up..." : "Sign up"}
                    </Button>
                </Box>
                <Box>
                    <Link component={RouterLink} to="/">
                        Back to home
                    </Link>
                </Box>
            </Paper>
            <Snackbar
                open={isSnackBarOpen}
                autoHideDuration={2000}
                message={message}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Container>
    );
};

export default Register;
