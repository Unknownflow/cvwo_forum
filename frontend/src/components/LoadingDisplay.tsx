import { Box, CircularProgress } from "@mui/material";
import React from "react";

const LoadingDisplay: React.FC = () => {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
        </Box>
    );
};

export default LoadingDisplay;
