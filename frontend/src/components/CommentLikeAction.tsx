import { readCommentLikes } from "../api/commentLikes";
import { useUser } from "../context/userContext";
import { useCreateCommentLike, useDeleteCommentLike } from "../hooks/commentLikes";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

type LikeType = -1 | 0 | 1;

type Props = {
    commentID: number;
    postID: number;
    likesCount: number;
};

const CommentLikeAction: React.FC<Props> = ({ commentID, postID, likesCount }) => {
    const { user } = useUser();
    const createCommentLikeMutation = useCreateCommentLike(commentID, postID, user);
    const deleteCommentLikeMutation = useDeleteCommentLike(commentID, postID, user);
    const [likeStatus, setLikeStatus] = useState<LikeType>(0);
    const { data: commentLikesData } = useQuery({
        queryKey: ["commentLikes", commentID, user],
        queryFn: () => readCommentLikes(commentID),
        enabled: commentID > 0, // only query if id is valid
    });

    // Sync likeStatus with query data
    useEffect(() => {
        if (commentLikesData) {
            setLikeStatus(commentLikesData.likeType);
        }
    }, [commentLikesData]);

    const likeColor = likeStatus === 1 ? "primary" : "default";
    const dislikeColor = likeStatus === -1 ? "primary" : "default";

    const handleLikeUpdate = () => {
        if (likeStatus === 1) {
            // Already liked, remove like
            deleteCommentLikeMutation.mutate({ id: commentID, commentID, likeType: likeStatus });
            setLikeStatus(0);
        } else {
            // Not liked or disliked, add like
            if (likeStatus === -1) {
                deleteCommentLikeMutation.mutate({ id: commentID, commentID, likeType: likeStatus });
            }
            createCommentLikeMutation.mutate({ commentID, likeType: 1 });
            setLikeStatus(1);
        }
    };

    const handleDislikeUpdate = () => {
        if (likeStatus === -1) {
            // Already disliked, remove dislike
            deleteCommentLikeMutation.mutate({ id: commentID, commentID, likeType: likeStatus });
            setLikeStatus(0);
        } else {
            // Not disliked or liked, add dislike
            if (likeStatus === 1) {
                deleteCommentLikeMutation.mutate({ id: commentID, commentID, likeType: likeStatus });
            }
            createCommentLikeMutation.mutate({ commentID, likeType: -1 });
            setLikeStatus(-1);
        }
    };

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleLikeUpdate} color={likeColor}>
                <ThumbUpIcon />
            </IconButton>
            {likesCount}
            <IconButton onClick={handleDislikeUpdate} color={dislikeColor}>
                <ThumbDownIcon />
            </IconButton>
        </Box>
    );
};
export default CommentLikeAction;
