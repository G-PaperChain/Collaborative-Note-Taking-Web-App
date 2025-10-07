import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import axios from "axios";
import { useApi } from "./Api";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const AuthProvider = ({ children }) => {
    
    const register = async (userData) => {
        try {
            setLoading(true);
            const res = await api.post("/register", userData);
            setUser(res.data.user || null);
            return { success: true, user: res.data.user || null };
        } catch (err) {
            const message =
                err?.response?.data?.error || err.message || "Registration failed";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };


    const value = {
        // user,
        // loading,
        // isInitialized,
        // login,
        register,
        // logout,
        // fetchCurrentUser,
        // changePassword,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}