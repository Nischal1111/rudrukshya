import axios from "axios";

export const getAllOrders = async (page: number, limit: number, token: string) => {
    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/order/all?page=${page}&limit=${limit}`,
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

export const editOrder = async (id: string, data: any, token: string) => {
    try {
        const res = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/order/${id}`,
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

export const updateOrderStatus = async (id: string, status: string, token: string) => {
    try {
        const res = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/order/${id}/status`,
            { status },
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

export const updatePaymentStatus = async (id: string, status: string, token: string) => {
    try {
        const res = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/order/${id}/payment`,
            { status },
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

export const deleteOrder = async (id: string, token: string) => {
    try {
        const res = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/order/${id}`,
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
