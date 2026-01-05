import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate("/register");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="h6">Welcome to the NUS Forum!</Typography>
                    <Typography>Sign up for an account to engage in discussions with other NUS students!</Typography>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <Button variant="outlined" onClick={handleRegister}>
                            Register
                        </Button>
                        <Button variant="outlined" onClick={handleLogin}>
                            Login
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Home;
