import axios from "axios";

export const createPromocode = async (data: any, token: string) => {
    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/promocode/create`,
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

export const deletePromocode = async (id: string, token: string) => {
    try {
        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/promocode/delete/${id}`,
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

export const updatePromocode = async (id: string, data: any, token: string) => {
    try {
        const res = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/promocode/update/${id}`,
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

export const listPromocodes = async (token: string) => {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/promocode/list`,
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
