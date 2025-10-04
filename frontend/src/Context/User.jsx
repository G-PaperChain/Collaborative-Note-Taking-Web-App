import { createContext, useContext, useState, useEffect } from "react";
import { api } from "./Api";

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser should be used within UserProvider");
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get("/user");
            setUser(response.data);
        } catch (error) {
            console.log("Not authenticated");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const value = { user, loading, checkAuth, logout };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};