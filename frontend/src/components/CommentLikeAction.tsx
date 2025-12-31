import { readCommentLikes, readCommentLikesCount } from "../api/commentLikes";
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
};

const CommentLikeAction: React.FC<Props> = ({ commentID, postID }) => {
    const { user } = useUser();
    const createCommentLikeMutation = useCreateCommentLike(commentID, postID, user);
    const deleteCommentLikeMutation = useDeleteCommentLike(commentID, postID, user);
    const [likeStatus, setLikeStatus] = useState<LikeType>(0);
    const { data: commentLikesData } = useQuery({
        queryKey: ["commentLikes", commentID, user],
        queryFn: () => readCommentLikes(commentID),
    });
    const { data: commentLikesCount } = useQuery({
        queryKey: ["commentLikesCount", commentID],
        queryFn: () => readCommentLikesCount(commentID),
    });

    // Sync likeStatus with query data
    useEffect(() => {
        if (commentLikesData) {
            setLikeStatus(commentLikesData.like_type);
        }
    }, [commentLikesData]);

    const likeColor = likeStatus === 1 ? "primary" : "default";
    const dislikeColor = likeStatus === -1 ? "primary" : "default";

    const handleLikeUpdate = () => {
        if (likeStatus === 1) {
            // Already liked, remove like
            deleteCommentLikeMutation.mutate(commentID);
            setLikeStatus(0);
        } else {
            // Not liked or disliked, add like
            if (likeStatus === -1) {
                deleteCommentLikeMutation.mutate(commentID);
            }
            createCommentLikeMutation.mutate({ id: -1, comment_id: commentID, like_type: 1 });
            setLikeStatus(1);
        }
    };

    const handleDislikeUpdate = () => {
        if (likeStatus === -1) {
            // Already disliked, remove dislike
            deleteCommentLikeMutation.mutate(commentID);
            setLikeStatus(0);
        } else {
            // Not disliked or liked, add dislike
            if (likeStatus === 1) {
                deleteCommentLikeMutation.mutate(commentID);
            }
            createCommentLikeMutation.mutate({ id: -1, comment_id: commentID, like_type: -1 });
            setLikeStatus(-1);
        }
    };

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleLikeUpdate} color={likeColor}>
                <ThumbUpIcon />
            </IconButton>
            {commentLikesCount}
            <IconButton onClick={handleDislikeUpdate} color={dislikeColor}>
                <ThumbDownIcon />
            </IconButton>
        </Box>
    );
};
export default CommentLikeAction;
