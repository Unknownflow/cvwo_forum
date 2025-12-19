import React from "react";
import { Button, CircularProgress } from "@mui/material";

type Props = {
    handleConfirmEdit: () => void;
    handleCancelEdit: () => void;
    isLoading: boolean;
};

const EditModeAction: React.FC<Props> = ({ handleConfirmEdit, handleCancelEdit, isLoading }) => {
    return (
        <>
            <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleConfirmEdit}
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={16} />}
                aria-label="Confirm edit"
            >
                Confirm
            </Button>
            <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleCancelEdit}
                disabled={isLoading}
                aria-label="Cancel edit"
            >
                Cancel
            </Button>
        </>
    );
};

export default EditModeAction;
