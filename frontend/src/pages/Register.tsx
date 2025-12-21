import { useCreateUser } from "../hooks/users";
import AuthForm from "../components/AuthForm";
import { Box, Container, Link, Paper } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const Register: React.FC = () => {
    const createUserMutation = useCreateUser();

    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <AuthForm mutation={createUserMutation} label="sign up" />
                <Box>
                    <Link component={RouterLink} to="/" underline="hover">
                        Back to Home
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
