import { queryClient } from "../App";
import PostLike from "../types/PostLike";
import { createPostLike, deletePostLike } from "../api/postLikes";
import { useMutation } from "@tanstack/react-query";

const useCreatePostLike = (postID: number, topicID: number, username: string) => {
    const queryKey = ["postLikes", postID, username];

    return useMutation({
        mutationFn: createPostLike,
        onMutate: async (newLike: PostLike) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prevd value
            const previousPostLike = queryClient.getQueryData<PostLike>(queryKey);

            queryClient.setQueryData<PostLike>(queryKey, newLike);

            // Return context for rollback
            return { previousPostLike };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["postLikes", username] });
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
            queryClient.invalidateQueries({ queryKey: ["post", postID] });
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(queryKey, context?.previousPostLike);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useDeletePostLike = (postID: number, topicID: number, username: string) => {
    const queryKey = ["postLikes", postID, username];

    return useMutation({
        mutationFn: deletePostLike,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value (single PostLike object, not array)
            const previousPostLike = queryClient.getQueryData<PostLike>(queryKey);

            // Optimistically set to null or default state since like is deleted
            queryClient.setQueryData<PostLike>(queryKey, (old) => (old ? { ...old, likeType: 0 } : previousPostLike));

            return { previousPostLike };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["postLikes", username] });
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
            queryClient.invalidateQueries({ queryKey: ["post", postID] });
        },
        onError: (err, postID, context) => {
            queryClient.setQueryData(queryKey, context?.previousPostLike);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export { useCreatePostLike, useDeletePostLike };
