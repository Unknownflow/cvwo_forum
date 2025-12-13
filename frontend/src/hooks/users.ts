import { createUser, verifyUser } from "../api/user";
import { queryClient } from "../App";
import { useMutation } from "@tanstack/react-query";

const useVerifyUser = () => {
    return useMutation({
        mutationFn: verifyUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

const useCreateUser = () => {
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export { useVerifyUser, useCreateUser };
