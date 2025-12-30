import { queryClient } from "../App";
import CommentLike from "../types/CommentLike";
import { createCommentLike, deleteCommentLike } from "../api/commentLikes";
import { useMutation } from "@tanstack/react-query";

const useCreateCommentLike = (commentID: number, postID: string, username: string) => {
    return useMutation({
        mutationFn: createCommentLike,
        onMutate: async (newLike: CommentLike) => {
            // Cancel any outgoing refetches
            const queryKey = ["commentLikes", commentID, username];
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prevd value
            const previousCommentLike = queryClient.getQueryData<CommentLike>(queryKey);

            queryClient.setQueryData<CommentLike>(queryKey, newLike);

            // Return context for rollback
            return { previousCommentLike };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["commentLikesCount", commentID] });
            queryClient.invalidateQueries({ queryKey: ["commentLikes", username] });
            queryClient.invalidateQueries({ queryKey: ["postComments", postID] });
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["commentLikes", commentID, username], context?.previousCommentLike);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["commentLikes", commentID, username] });
        },
    });
};

const useDeleteCommentLike = (commentID: number, postID: string, username: string) => {
    return useMutation({
        mutationFn: deleteCommentLike,
        onMutate: async () => {
            const queryKey = ["commentLikes", commentID, username];
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value (single CommentLike object, not array)
            const previousCommentLike = queryClient.getQueryData<CommentLike>(queryKey);

            // Optimistically set to null or default state since like is deleted
            queryClient.setQueryData<CommentLike>(queryKey, (old) =>
                old ? { ...old, like_type: 0 } : previousCommentLike,
            );

            return { previousCommentLike };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["commentLikesCount", commentID] });
            queryClient.invalidateQueries({ queryKey: ["commentLikes", username] });
            queryClient.invalidateQueries({ queryKey: ["postComments", postID] });
        },
        onError: (err, commentID, context) => {
            queryClient.setQueryData(["commentLikes", commentID, username], context?.previousCommentLike);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["commentLikes", commentID, username] });
        },
    });
};

export { useCreateCommentLike, useDeleteCommentLike };
