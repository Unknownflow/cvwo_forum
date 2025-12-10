import Comment from "../types/Comment";

import React, { useState } from "react";
import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
    comment: Comment;
};

const useStyles = makeStyles(() => ({
    commentBody: {
        fontSize: 16,
        whiteSpace: "pre-wrap",
        paddingBottom: "1em",
    },
    commentCard: {
        marginBottom: "1em",
    },
    metadata: {
        fontSize: 14,
    },
}));

const CommentItem: React.FC<Props> = ({ comment }) => {
    const [isDeleted, setIsDeleted] = useState<boolean>(false);
    // const [isEditing, setIsEditing] = useState<boolean>(false);
    const classes = useStyles();

    const handleEdit = () => {
        // setIsEditing(true);
        // TODO: add connection to backend
    };

    const handleDelete = () => {
        setIsDeleted(true);

        // TODO: add connection to backend
    };

    if (!isDeleted) {
        return (
            <Card className={classes.commentCard}>
                <CardContent>
                    <Typography variant="body1" color="textPrimary" className={classes.commentBody} component="p">
                        {comment.body}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className={classes.metadata} gutterBottom>
                        {"Posted by " + comment.author + " on " + comment.timestamp.toLocaleString()}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={handleEdit}>
                        <EditIcon />
                    </Button>
                    <Button size="small" onClick={handleDelete}>
                        <DeleteIcon />
                    </Button>
                </CardActions>
            </Card>
        );
    }
};

export default CommentItem;
