import { queryClient } from "../App";
import PostLike from "../types/PostLike";
import { createPostLike, deletePostLike } from "../api/postLikes";
import { useMutation } from "@tanstack/react-query";

const useCreatePostLike = (postID: number, username: string) => {
    return useMutation({
        mutationFn: createPostLike,
        onMutate: async (newLike: PostLike) => {
            // Cancel any outgoing refetches
            const queryKey = ["postLikes", postID, username];
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prevd value
            const previousPostLike = queryClient.getQueryData<PostLike>(queryKey);

            queryClient.setQueryData<PostLike>(queryKey, newLike);

            // Return context for rollback
            return { previousPostLike };
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["postLikes", postID, username], context?.previousPostLike);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["postLikes", postID, username] });
        },
    });
};

const useDeletePostLike = (postID: number, username: string) => {
    return useMutation({
        mutationFn: deletePostLike,
        onMutate: async () => {
            const queryKey = ["postLikes", postID, username];
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value (single PostLike object, not array)
            const previousPostLike = queryClient.getQueryData<PostLike>(queryKey);

            // Optimistically set to null or default state since like is deleted
            queryClient.setQueryData<PostLike>(queryKey, (old) => (old ? { ...old, like_type: 0 } : previousPostLike));

            return { previousPostLike };
        },
        onError: (err, postId, context) => {
            queryClient.setQueryData(["postLikes", postID, username], context?.previousPostLike);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["postLikes", postID, username] });
        },
    });
};

export { useCreatePostLike, useDeletePostLike };
