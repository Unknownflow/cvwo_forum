import { Container, Link, Paper, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const Home: React.FC = () => {
    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <Typography variant="h6">Welcome to the NUS Forum.</Typography>
                <Typography>
                    You can create discussion topics and relevant posts and comments on NUS Forum. To start, you can{" "}
                    <Link component={RouterLink} to="/register" underline="hover">
                        register
                    </Link>{" "}
                    for a new account. If you already have an account, you can{" "}
                    <Link component={RouterLink} to="/login" underline="hover">
                        log in
                    </Link>{" "}
                    to your own account.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Home;
