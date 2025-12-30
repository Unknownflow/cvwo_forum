import { Box, Typography, Link } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";

const PageNotFound: React.FC = () => {
    return (
        <Box sx={{ p: 2 }}>
            <ErrorIcon color="error" fontSize="large" />
            <Typography variant="h4" gutterBottom>
                404 error
            </Typography>
            <Typography>The page doesn&apos;t exist.</Typography>
            <Typography gutterBottom>Are you sure that the website URL is correct?</Typography>
            <Typography>
                Return to{" "}
                <Link component={RouterLink} to="/" underline="hover">
                    home
                </Link>
                ?
            </Typography>
        </Box>
    );
};

export default PageNotFound;
