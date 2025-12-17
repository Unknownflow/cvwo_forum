import { CircularProgress, IconButton } from "@mui/material";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
    handleStartEdit: () => void;
    handleDelete: () => void;
    isLoading: boolean;
    isPending: boolean;
    type: string;
};

const ViewModeAction: React.FC<Props> = ({ handleStartEdit, handleDelete, isLoading, isPending, type }) => {
    const editLabel = `Edit ${type}`;
    const deleteLabel = `Delete ${type}`;
    return (
        <>
            <IconButton size="small" onClick={handleStartEdit} disabled={isLoading} aria-label={editLabel}>
                <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} disabled={isLoading} aria-label={deleteLabel}>
                {isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
            </IconButton>
        </>
    );
};

export default ViewModeAction;
