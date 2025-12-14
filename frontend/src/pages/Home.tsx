import { useVerifyUser } from "../hooks/users";
import AuthForm from "../components/AuthForm";
import { Box, Container, Link, Paper, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const Home: React.FC = () => {
    const verifyUserMutation = useVerifyUser();

    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <AuthForm mutation={verifyUserMutation} label="sign in" />
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="body2" sx={{ mr: 1, mt: 0.25 }}>
                        Don&apos;t have an account?
                    </Typography>
                    <Link component={RouterLink} to="/register" underline="hover">
                        Sign up
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default Home;
