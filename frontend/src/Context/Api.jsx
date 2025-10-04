import { createContext, useContext } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const ApiContext = createContext();

export const useApi = () => {
    const context = useContext(ApiContext)
    if (!context) throw new Error("useApi should be used within ApiProvider")
    return context
}

export const ApiProvider = ({ children }) => {

    const value = { api };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export { api };