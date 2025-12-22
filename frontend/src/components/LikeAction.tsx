import { readPostLikes } from "../api/postLikes";
import { useUser } from "../context/userContext";
import { useCreatePostLike, useDeletePostLike } from "../hooks/postLikes";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

type Props = {
    postID: number;
};

const LikeAction: React.FC<Props> = ({ postID }) => {
    const { user } = useUser();
    const { data } = useQuery({
        queryKey: ["postLikes", postID, user],
        queryFn: () => readPostLikes(postID),
    });

    const createPostLikeMutation = useCreatePostLike(postID, user);
    const deletePostLikeMutation = useDeletePostLike(postID, user);

    const [likeStatus, setLikeStatus] = useState<-1 | 0 | 1>(0);

    // Sync likeStatus with query data
    useEffect(() => {
        if (data) {
            setLikeStatus(data.like_type);
        }
    }, [data]);

    const likeColor = likeStatus === 1 ? "primary" : "default";
    const dislikeColor = likeStatus === -1 ? "primary" : "default";

    const handleLikeUpdate = () => {
        if (likeStatus === 1) {
            // Already liked, remove like
            deletePostLikeMutation.mutate(postID);
            setLikeStatus(0);
        } else {
            // Not liked or disliked, add like
            if (likeStatus === -1) {
                deletePostLikeMutation.mutate(postID);
            }
            createPostLikeMutation.mutate({ id: -1, post_id: postID, like_type: 1 });
            setLikeStatus(1);
        }
    };

    const handleDislikeUpdate = () => {
        if (likeStatus === -1) {
            // Already disliked, remove dislike
            deletePostLikeMutation.mutate(postID);
            setLikeStatus(0);
        } else {
            // Not disliked or liked, add dislike
            if (likeStatus === 1) {
                deletePostLikeMutation.mutate(postID);
            }
            createPostLikeMutation.mutate({ id: -1, post_id: postID, like_type: -1 });
            setLikeStatus(-1);
        }
    };

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleLikeUpdate} color={likeColor}>
                <ThumbUpIcon />
            </IconButton>
            <IconButton onClick={handleDislikeUpdate} color={dislikeColor}>
                <ThumbDownIcon />
            </IconButton>
        </Box>
    );
};
export default LikeAction;
