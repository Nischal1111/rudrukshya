import axios from "axios";

export const createUpload = async (data: any, token: string) => {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/upload/uploads`,
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
        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/upload/uploads/${id}`,
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
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/upload/uploads/${id}/media`,
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
        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/upload/uploads/${id}/media/${mediaId}`,
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
        const res = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/upload/uploads/${id}/media/${mediaId}`,
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
