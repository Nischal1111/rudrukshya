import api, { axios } from "./api";

export const getDashboardStats = async (token: string) => {
    try {
        const res = await api.get(
            `/dashboard/stats`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};
