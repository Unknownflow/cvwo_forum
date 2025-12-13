import { createPost, deletePost, updatePost } from "../api/post";
import PostRequest from "../types/PostRequest";
import { queryClient } from "../App";
import Post from "../types/Post";
import { useMutation } from "@tanstack/react-query";

const useCreatePost = (topicID: string) => {
    return useMutation({
        mutationFn: createPost,
        onMutate: async (post: PostRequest) => {
            // Cancel any outgoing refetches

            await queryClient.cancelQueries({ queryKey: ["topicPosts", topicID] });

            // Snapshot prevd value
            const previousPosts = queryClient.getQueryData<Post[]>(["topicPosts", topicID]);

            const optimisticPost = { ...post, id: -Date.now(), createdAt: new Date().toISOString() };

            queryClient.setQueryData<Post[]>(["topicPosts", topicID], (old) => [...(old ?? []), optimisticPost]);

            // Return context for rollback
            return { previousPosts };
        },
        onError: (error, newPost, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["topicPosts", topicID], context?.previousPosts);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
        },
    });
};

const useUpdatePost = (topicID: string) => {
    return useMutation({
        mutationFn: updatePost,
        // Optimistically update UI before server responds
        onMutate: async (updatedPost: Post) => {
            // Cancel any outgoing refetches
            const queryKey = ["topicPosts", topicID];
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
            queryClient.setQueryData(["topicPosts", topicID], context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
        },
    });
};

const useDeletePost = (topicID: string) => {
    return useMutation({
        mutationFn: deletePost,
        // Optimistically update UI before server responds
        onMutate: async (postId: number) => {
            // Cancel any outgoing refetches
            const queryKey = ["topicPosts", topicID];
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

            // Optimistically update by removing post
            queryClient.setQueryData<Post[]>(queryKey, (old) => old?.filter((t) => t.id !== postId) ?? []);

            // Return context with snapshot
            return { previousPosts };
        },
        // If mutation fails, rollback to prev value
        onError: (err, postId, context) => {
            queryClient.setQueryData(["topicPosts", topicID], context?.previousPosts);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topicPosts", topicID] });
        },
    });
};

export { useCreatePost, useUpdatePost, useDeletePost };
