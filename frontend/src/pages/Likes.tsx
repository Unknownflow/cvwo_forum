import { useUser } from "../context/userContext";
import { readPostsLikes } from "../api/postLikes";
import PostItem from "../components/PostItem";
import Post from "../types/Post";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { readCommentsLikes } from "../api/commentLikes";
import CommentItem from "../components/CommentItem";
import Comment from "../types/Comment";
import SortOrder, { DEFAULT_SORT_ORDER } from "../types/SortOrder";
import SortButton from "../components/SortButton";
import { Box, Link, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";

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
    const [postsOrder, setPostsOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
    const [commentsOrder, setCommentsOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);

    const {
        isLoading: isPostLikesLoading,
        isError: isPostLikesError,
        data: postData,
    } = useQuery({
        queryKey: ["postLikes", user, postsOrder],
        queryFn: () => readPostsLikes(postsOrder),
    });

    const {
        isLoading: isCommentLikesLoading,
        isError: isCommentLikesError,
        data: commentData,
    } = useQuery({
        queryKey: ["commentLikes", user, commentsOrder],
        queryFn: () => readCommentsLikes(commentsOrder),
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="h1">
                Liked Posts
            </Typography>
            {isPostLikesLoading && <LoadingDisplay />}
            {isPostLikesError && <ErrorDisplay type={"liked posts"} />}
            {!postData && <Typography>No liked posts yet.</Typography>}

            <Box sx={style}>
                {postData != null && <SortButton order={postsOrder} setOrder={setPostsOrder} />}
                {!isPostLikesLoading &&
                    !isPostLikesError &&
                    postData?.map((post: Post) => (
                        <Stack sx={{ width: "100%" }} key={post.id}>
                            <Link
                                component={RouterLink}
                                to={"/topics/" + post.topicID + "/posts"}
                                sx={{ textAlign: "left", width: "fit-content", mb: 1, ml: 1 }}
                                underline="hover"
                            >
                                {post.title}
                            </Link>
                            <PostItem post={post} editable={true} />
                        </Stack>
                    ))}
            </Box>

            <Typography variant="h6" component="h1" gutterBottom>
                Liked Comments
            </Typography>
            {isCommentLikesLoading && <LoadingDisplay />}
            {isCommentLikesError && <ErrorDisplay type="liked comments" />}
            {!commentData && <Typography>No liked comments yet.</Typography>}

            <Box sx={style}>
                {commentData != null && <SortButton order={commentsOrder} setOrder={setCommentsOrder} />}
                {!isCommentLikesLoading &&
                    !isCommentLikesError &&
                    commentData?.map((comment: Comment) => (
                        <Stack sx={{ width: "100%" }} key={comment.id}>
                            <Link
                                component={RouterLink}
                                to={"/topics/" + comment.topicID + "/posts/" + comment.postID + "/comments"}
                                sx={{ textAlign: "left", width: "fit-content", mb: 1, ml: 1 }}
                                underline="hover"
                            >
                                {comment.header}
                            </Link>
                            <CommentItem key={comment.id} comment={comment} />
                        </Stack>
                    ))}
            </Box>
        </Box>
    );
};

export default Likes;
