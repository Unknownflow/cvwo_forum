import { Box, Button, Container, Link, Paper, TextField, Typography } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

const Register: React.FC = () => {
    const [user, setUser] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !password) {
            alert("Please enter both username and password");
            return;
        }
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
                        onChange={(event) => setUser(event.target.value)}
                    />
                    <TextField
                        placeholder="Enter password"
                        required
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <Button type="submit" variant="contained">
                        Sign up
                    </Button>
                </Box>
                <Box>
                    <Link component={RouterLink} to="/">
                        Back to home
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
