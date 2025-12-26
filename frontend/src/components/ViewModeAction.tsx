import {
    CircularProgress,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import React, { useState } from "react";
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
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const handleDialogClose = () => setIsDialogOpen(false);
    const handleDialogOpen = () => setIsDialogOpen(true);

    const handleConfirmDelete = () => {
        handleDialogClose();
        handleDelete();
    };

    return (
        <>
            <IconButton size="small" onClick={handleStartEdit} disabled={isLoading} aria-label={editLabel}>
                <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={handleDialogOpen} disabled={isLoading} aria-label={deleteLabel}>
                {isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
            </IconButton>

            <Dialog open={isDialogOpen} onClose={handleDialogClose} sx={{ padding: 2 }}>
                <DialogTitle>Confirm delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this {type}?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ViewModeAction;
