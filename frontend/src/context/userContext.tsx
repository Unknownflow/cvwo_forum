import React, { createContext, ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
    children: ReactNode;
};

interface UserContextType {
    user: string;
    login: (user: string) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<string>("");
    const navigate = useNavigate();

    const login = (user: string) => {
        setUser(user);
    };

    const logout = () => {
        setUser("");
        navigate("/");
    };

    return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used in a UserProvider");
    }
    return context;
};

export default UserContext;
