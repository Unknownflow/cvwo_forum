import { Alert } from "@mui/material";
import React from "react";

type Props = {
    type: string;
};

const ErrorDisplay: React.FC<Props> = ({ type }) => {
    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            Error loading {type}.
        </Alert>
    );
};

export default ErrorDisplay;
