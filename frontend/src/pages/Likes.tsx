import { useUser } from "../context/userContext";
import { readPostsLikes } from "../api/postLikes";
import PostItem from "../components/PostItem";
import Post from "../types/Post";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { readCommentsLikes } from "../api/commentLikes";
import CommentItem from "../components/CommentItem";
import Comment from "../types/Comment";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const style = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    mx: "auto",
    gap: 2,
    maxWidth: 800,
    py: 2,
};

const Likes: React.FC = () => {
    const { user } = useUser();

    const {
        isLoading: isPostLikesLoading,
        isError: isPostLikesError,
        data: postData,
    } = useQuery({
        queryKey: ["postLikes", user],
        queryFn: readPostsLikes,
    });

    const {
        isLoading: isCommentLikesLoading,
        isError: isCommentLikesError,
        data: commentData,
    } = useQuery({
        queryKey: ["commentLikes", user],
        queryFn: readCommentsLikes,
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="h1">
                Liked Posts
            </Typography>
            {isPostLikesLoading && <LoadingDisplay />}
            {isPostLikesError && <ErrorDisplay type="liked posts" />}
            {!postData && <Typography>No liked posts yet.</Typography>}

            <Box sx={style}>
                {!isPostLikesLoading &&
                    !isPostLikesError &&
                    postData?.map((post: Post) => (
                        <PostItem key={post.id} post={post} topicID={post.topic_id.toString()} editable={true} />
                    ))}
            </Box>

            <Typography variant="h6" component="h1" gutterBottom>
                Liked Comments
            </Typography>
            {isCommentLikesLoading && <LoadingDisplay />}
            {isCommentLikesError && <ErrorDisplay type="liked comments" />}
            {!commentData && <Typography>No liked comments yet.</Typography>}

            <Box sx={style}>
                {!isCommentLikesLoading &&
                    !isCommentLikesError &&
                    commentData?.map((comment: Comment) => (
                        <CommentItem key={comment.id} comment={comment} postID={comment.post_id.toString()} />
                    ))}
            </Box>
        </Box>
    );
};

export default Likes;
