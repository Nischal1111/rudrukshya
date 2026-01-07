import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                // Token expired or unauthorized, trigger logout
                await signOut({ callbackUrl: "/login" });
            }
        }
        return Promise.reject(error);
    }
);

export { axios };
export default api;
