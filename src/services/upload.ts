import api, { axios } from "./api";

export const createUpload = async (data: any, token: string) => {
    try {
        const res = await api.post(
            `/upload/uploads`,
            data,
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

export const deleteUpload = async (id: string, token: string) => {
    try {
        const res = await api.delete(
            `/upload/uploads/${id}`,
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

export const addMedia = async (id: string, data: any, token: string) => {
    try {
        const res = await api.post(
            `/upload/uploads/${id}/media`,
            data,
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

export const removeMedia = async (id: string, mediaId: string, token: string) => {
    try {
        const res = await api.delete(
            `/upload/uploads/${id}/media/${mediaId}`,
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

export const updateMedia = async (id: string, mediaId: string, data: any, token: string) => {
    try {
        const res = await api.patch(
            `/upload/uploads/${id}/media/${mediaId}`,
            data,
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
