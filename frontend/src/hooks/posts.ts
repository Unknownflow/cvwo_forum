import { createPost, deletePost, updatePost } from "../api/post";
import PostRequest from "../types/PostRequest";
import { queryClient } from "../App";
import Post from "../types/Post";
import SortOrder from "../types/SortOrder";
import { useMutation } from "@tanstack/react-query";

const useCreatePost = (topicID: number, order: SortOrder) => {
    const queryKey = ["topicPosts", topicID, order];

    return useMutation({
        mutationFn: createPost,
        onMutate: async (post: PostRequest) => {
            // Cancel any outgoing refetches

            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

            const optimisticPost = {
                ...post,
                id: -Date.now(),
                created_at: new Date().toISOString(),
                likes_count: 0,
                comments_count: 0,
            };

            queryClient.setQueryData<Post[]>(queryKey, (old) => [...(old ?? []), optimisticPost]);

            // Return context for rollback
            return { previousPosts };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic", topicID] });
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(queryKey, context?.previousPosts);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useUpdatePost = (topicID: number) => {
    const queryKey = ["topicPosts", topicID];

    return useMutation({
        mutationFn: updatePost,
        // Optimistically update UI before server responds
        onMutate: async (updatedPost: Post) => {
            // Cancel any outgoing refetches

            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

            // Optimistically update post in list
            queryClient.setQueryData<Post[]>(
                queryKey,
                (old) => old?.map((t) => (t.id === updatedPost.id ? { ...t, ...updatedPost } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousPosts };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedPost, context) => {
            queryClient.setQueryData(queryKey, context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useDeletePost = (topicID: number) => {
    const queryKey = ["topicPosts", topicID];

    return useMutation({
        mutationFn: deletePost,
        // Optimistically update UI before server responds
        onMutate: async (postId: number) => {
            // Cancel any outgoing refetches

            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

            // Optimistically update by removing post
            queryClient.setQueryData<Post[]>(queryKey, (old) => old?.filter((t) => t.id !== postId) ?? []);

            // Return context with snapshot
            return { previousPosts };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic", topicID] });
        },
        // If mutation fails, rollback to prev value
        onError: (err, postId, context) => {
            queryClient.setQueryData(queryKey, context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export { useCreatePost, useUpdatePost, useDeletePost };
