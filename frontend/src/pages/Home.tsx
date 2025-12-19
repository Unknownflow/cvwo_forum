import { Container, Paper } from "@mui/material";
import React from "react";

const Home: React.FC = () => {
    return (
        <Container maxWidth="xs">
            <Paper elevation={12} sx={{ marginTop: 8, padding: 2 }}>
                Welcome to the web forum
            </Paper>
        </Container>
    );
};

export default Home;
