import { createTopic, deleteTopic, updateTopic } from "../api/topic";
import { queryClient } from "../App";
import Topic, { TopicRequest } from "../types/Topic";
import { useMutation } from "@tanstack/react-query";

const useCreateTopic = () => {
    const queryKey = ["topics"];

    return useMutation({
        mutationFn: createTopic,
        onMutate: async (topic: TopicRequest) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prevd value
            const previousTopics = queryClient.getQueryData<Topic[]>(queryKey);

            // Optimistically add the new topic with a temporary ID
            const optimisticTopic = {
                ...topic,
                id: -Date.now(),
                posts_count: 0,
            };

            queryClient.setQueryData<Topic[]>(queryKey, (old) => [...(old ?? []), optimisticTopic]);

            // Return context for rollback
            return { previousTopics };
        },
        onError: (error, newTopic, context) => {
            // Rollback to previous state
            queryClient.setQueryData(queryKey, context?.previousTopics);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useUpdateTopic = () => {
    const queryKey = ["topics"];

    return useMutation({
        mutationFn: updateTopic,
        // Optimistically update UI before server responds
        onMutate: async (updatedTopic: Topic) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(queryKey);

            // Optimistically update topic in list
            queryClient.setQueryData<Topic[]>(
                queryKey,
                (old) => old?.map((t) => (t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedTopic, context) => {
            queryClient.setQueryData(queryKey, context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

const useDeleteTopic = () => {
    const queryKey = ["topics"];

    return useMutation({
        mutationFn: deleteTopic,
        // Optimistically update UI before server responds
        onMutate: async (topicId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(queryKey);

            // Optimistically update by removing topic
            queryClient.setQueryData<Topic[]>(queryKey, (old) => old?.filter((t) => t.id !== topicId) ?? []);

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, topicId, context) => {
            queryClient.setQueryData(queryKey, context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export { useCreateTopic, useUpdateTopic, useDeleteTopic };
