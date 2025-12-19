import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";

type Props = {
    handleConfirm: () => void;
    handleCancel: () => void;
    isSubmitting: boolean;
};

const ModalActions: React.FC<Props> = ({ handleConfirm, handleCancel, isSubmitting }) => {
    return (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="outlined" color="error" onClick={handleCancel} disabled={isSubmitting} aria-label="Cancel">
                Cancel
            </Button>
            <Button
                variant="contained"
                color="success"
                onClick={handleConfirm}
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={16} />}
                aria-label="Confirm"
            >
                {isSubmitting ? "Creating..." : "Confirm"}
            </Button>
        </Box>
    );
};

export default ModalActions;
