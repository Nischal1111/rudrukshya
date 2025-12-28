import axios from "axios";

export const createVariant = async (data: any, token: string) => {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/variant/create`,
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

export const updateVariant = async (id: string, data: any, token: string) => {
    try {
        const res = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/variant/update/${id}`,
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

export const deleteVariant = async (id: string, token: string) => {
    try {
        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/variant/delete/${id}`,
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
