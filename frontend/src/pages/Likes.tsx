import { useUser } from "../context/userContext";
import { readPostsLikes } from "../api/postLikes";
import PostItem from "../components/PostItem";
import Post from "../types/Post";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { readCommentsLikes } from "../api/commentLikes";
import CommentItem from "../components/CommentItem";
import Comment from "../types/Comment";
import SortOrder, { commentsSortOptions, DEFAULT_SORT_ORDER, postsSortOptions } from "../types/SortOrder";
import SortButton from "../components/SortButton";
import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type View = "posts" | "comments";

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
    const navigate = useNavigate();
    const { user } = useUser();
    const [postsOrder, setPostsOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
    const [commentsOrder, setCommentsOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
    const [currentView, setCurrentView] = useState<View>("posts");

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

    const handleViewChange = (view: View) => {
        setCurrentView(view);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                    variant="contained"
                    onClick={() => handleViewChange("posts")}
                    sx={{ background: currentView === "posts" ? "#5959c8" : "7f7fd5" }}
                >
                    Posts
                </Button>
                <Button
                    variant="contained"
                    onClick={() => handleViewChange("comments")}
                    sx={{ background: currentView === "comments" ? "#5959c8" : "7f7fd5" }}
                >
                    Comments
                </Button>
            </Stack>

            {currentView === "posts" && (
                <>
                    <Box sx={style}>
                        {isPostLikesLoading && <LoadingDisplay />}
                        {isPostLikesError && <ErrorDisplay type="liked posts" />}
                        {!isPostLikesLoading && !isPostLikesError && postData == null && (
                            <Typography>No liked posts yet.</Typography>
                        )}

                        {postData != null && (
                            <SortButton order={postsOrder} setOrder={setPostsOrder} sortOptions={postsSortOptions} />
                        )}
                        {!isPostLikesLoading &&
                            !isPostLikesError &&
                            postData?.map((post: Post) => (
                                <Stack sx={{ width: "100%" }} key={post.id}>
                                    <Button
                                        variant="contained"
                                        sx={{ width: "fit-content", mb: 1 }}
                                        onClick={() => navigate("/topics/" + post.topicID + "/posts")}
                                    >
                                        {post.title}
                                    </Button>
                                    <PostItem post={post} editable={true} />
                                </Stack>
                            ))}
                    </Box>
                </>
            )}

            {currentView === "comments" && (
                <>
                    <Box sx={style}>
                        {isCommentLikesLoading && <LoadingDisplay />}
                        {isCommentLikesError && <ErrorDisplay type="liked comments" />}
                        {!isCommentLikesLoading && !isCommentLikesError && commentData == null && (
                            <Typography>No liked comments yet.</Typography>
                        )}

                        {commentData != null && (
                            <SortButton
                                order={commentsOrder}
                                setOrder={setCommentsOrder}
                                sortOptions={commentsSortOptions}
                            />
                        )}
                        {!isCommentLikesLoading &&
                            !isCommentLikesError &&
                            commentData?.map((comment: Comment) => (
                                <Stack sx={{ width: "100%" }} key={comment.id}>
                                    <Button
                                        variant="contained"
                                        sx={{ width: "fit-content", mb: 1 }}
                                        onClick={() =>
                                            navigate(
                                                "/topics/" + comment.topicID + "/posts/" + comment.postID + "/comments",
                                            )
                                        }
                                    >
                                        {comment.header}
                                    </Button>
                                    <CommentItem key={comment.id} comment={comment} />
                                </Stack>
                            ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default Likes;
