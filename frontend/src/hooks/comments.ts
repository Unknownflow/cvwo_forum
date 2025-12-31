import { createComment, deleteComment, updateComment } from "../api/comments";
import { queryClient } from "../App";
import Comment from "../types/Comment";
import CommentRequest from "../types/CommentRequest";
import { useMutation } from "@tanstack/react-query";

const useCreateComment = (postID: number, order: string) => {
    const queryKey = ["postComments", postID, order];

    return useMutation({
        mutationFn: createComment,
        onMutate: async (comment: CommentRequest) => {
            // Cancel any outgoing refetches

            await queryClient.cancelQueries({ queryKey });

            // Snapshot prevd value
            const previousComments = queryClient.getQueryData<Comment[]>(queryKey);

            const optimisticComment = { ...comment, id: -Date.now(), created_at: new Date().toISOString() };

            queryClient.setQueryData<Comment[]>(queryKey, (old) => [...(old ?? []), optimisticComment]);

            // Return context for rollback
            return { previousComments };
        },
        onError: (error, newComment, context) => {
            // Rollback to previous state
            queryClient.setQueryData(queryKey, context?.previousComments);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useUpdateComment = (postID: number) => {
    const queryKey = ["postComments", postID];

    return useMutation({
        mutationFn: updateComment,
        // Optimistically update UI before server responds
        onMutate: async (updatedComment: Comment) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousComments = queryClient.getQueryData<Comment[]>(queryKey);

            // Optimistically update post in list
            queryClient.setQueryData<Comment[]>(
                queryKey,
                (old) => old?.map((t) => (t.id === updatedComment.id ? { ...t, ...updatedComment } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousComments };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedComment, context) => {
            queryClient.setQueryData(queryKey, context?.previousComments);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useDeleteComment = (postID: number) => {
    const queryKey = ["postComments", postID];

    return useMutation({
        mutationFn: deleteComment,
        // Optimistically update UI before server responds
        onMutate: async (commentID: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousComments = queryClient.getQueryData<Comment[]>(queryKey);

            // Optimistically update by removing post
            queryClient.setQueryData<Comment[]>(queryKey, (old) => old?.filter((t) => t.id !== commentID) ?? []);

            // Return context with snapshot
            return { previousComments };
        },
        // If mutation fails, rollback to prev value
        onError: (err, commentID, context) => {
            queryClient.setQueryData(queryKey, context?.previousComments);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export { useCreateComment, useUpdateComment, useDeleteComment };
