import { createTopic, deleteTopic, updateTopic } from "../api/topic";
import { queryClient } from "../App";
import Topic from "../types/Topic";
import { useMutation } from "@tanstack/react-query";

const useCreateTopic = () => {
    return useMutation({
        mutationFn: createTopic,
        onMutate: async (title: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prevd value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically add the new topic with a temporary ID
            const optimisticTopic = {
                title: title,
                id: -Date.now(),
            };

            queryClient.setQueryData<Topic[]>(["topics"], (old) => [...(old ?? []), optimisticTopic]);

            // Return context for rollback
            return { previousTopics };
        },
        onError: (error, newTopic, context) => {
            // Rollback to previous state
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        onSettled: () => {
            // Sync with server (replaces temp ID with real ID)
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });
};

const useUpdateTopic = () => {
    return useMutation({
        mutationFn: updateTopic,
        // Optimistically update UI before server responds
        onMutate: async (updatedTopic: Topic) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically update topic in list
            queryClient.setQueryData<Topic[]>(
                ["topics"],
                (old) => old?.map((t) => (t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t)) ?? [],
            );

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, updatedTopic, context) => {
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });
};

const useDeleteTopic = () => {
    return useMutation({
        mutationFn: deleteTopic,
        // Optimistically update UI before server responds
        onMutate: async (topicId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["topics"] });

            // Snapshot prev value
            const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);

            // Optimistically update by removing topic
            queryClient.setQueryData<Topic[]>(["topics"], (old) => old?.filter((t) => t.id !== topicId) ?? []);

            // Return context with snapshot
            return { previousTopics };
        },
        // If mutation fails, rollback to prev value
        onError: (err, topicId, context) => {
            queryClient.setQueryData(["topics"], context?.previousTopics);
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });
};

export { useCreateTopic, useUpdateTopic, useDeleteTopic };
