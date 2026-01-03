import { readPostLikes } from "../api/postLikes";
import { useUser } from "../context/userContext";
import { useCreatePostLike, useDeletePostLike } from "../hooks/postLikes";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

type LikeType = -1 | 0 | 1;

type Props = {
    postID: number;
    topicID: number;
    likesCount: number;
};

const PostLikeAction: React.FC<Props> = ({ postID, topicID, likesCount }) => {
    const { user } = useUser();
    const [likeStatus, setLikeStatus] = useState<LikeType>(0);
    const { data: postLikesData } = useQuery({
        queryKey: ["postLikes", postID, user],
        queryFn: () => readPostLikes(postID),
        enabled: postID > 0, // only query if id is valid
    });

    const createPostLikeMutation = useCreatePostLike(postID, topicID, user);
    const deletePostLikeMutation = useDeletePostLike(postID, topicID, user);

    // Sync likeStatus with query data
    useEffect(() => {
        if (postLikesData) {
            setLikeStatus(postLikesData.likeType);
        }
    }, [postLikesData]);

    const likeColor = likeStatus === 1 ? "primary" : "default";
    const dislikeColor = likeStatus === -1 ? "primary" : "default";

    const handleLikeUpdate = () => {
        if (likeStatus === 1) {
            // Already liked, remove like
            deletePostLikeMutation.mutate({ id: postID, postID, likeType: likeStatus });
            setLikeStatus(0);
        } else {
            // Not liked or disliked, add like
            if (likeStatus === -1) {
                deletePostLikeMutation.mutate({ id: postID, postID, likeType: likeStatus });
            }
            createPostLikeMutation.mutate({ id: -1, postID, likeType: 1 });
            setLikeStatus(1);
        }
    };

    const handleDislikeUpdate = () => {
        if (likeStatus === -1) {
            // Already disliked, remove dislike
            deletePostLikeMutation.mutate({ id: postID, postID, likeType: likeStatus });
            setLikeStatus(0);
        } else {
            // Not disliked or liked, add dislike
            if (likeStatus === 1) {
                deletePostLikeMutation.mutate({ id: postID, postID, likeType: likeStatus });
            }
            createPostLikeMutation.mutate({ id: -1, postID, likeType: -1 });
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
export default PostLikeAction;
