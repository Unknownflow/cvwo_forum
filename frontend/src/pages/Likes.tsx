import { Container, Paper, Typography } from "@mui/material";
import React from "react";

const Likes: React.FC = () => {
    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                <Typography variant="h6">Likes</Typography>
            </Paper>
        </Container>
    );
};

export default Likes;
