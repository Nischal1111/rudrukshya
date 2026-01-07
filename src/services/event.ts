import api, { axios } from "./api";

// Get all events with optional pagination and filter
export const getAllEvents = async (page: number = 1, limit: number = 1, isActive?: boolean) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (isActive !== undefined) {
      params.append("isActive", isActive.toString());
    }

    const res = await api.get(
      `/event/get?${params.toString()}`
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

// Get single event by ID
export const getEventById = async (id: string) => {
  try {
    const res = await api.get(
      `/event/events/${id}`
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

// Create new event (requires FormData with bannerPopUpImage and bannerImage files)
export const createEvent = async (data: FormData, token: string) => {
  try {
    const res = await api.post(
      `/event/create`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
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

// Update event (supports FormData for image updates)
export const updateEvent = async (id: string, data: FormData | any, token: string) => {
  try {
    const config: any = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };
    if (data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    const res = await api.put(
      `/event/events/${id}`,
      data,
      config
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

// Toggle event active status
export const toggleEventStatus = async (id: string, token: string) => {
  try {
    const res = await api.patch(
      `/event/events/${id}/toggle-status`,
      {},
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

// Delete event
export const deleteEvent = async (id: string, token: string) => {
  try {
    const res = await api.delete(
      `/event/events/${id}`,
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

// Add products to event
export const addProductsToEvent = async (eventId: string, productIds: string[], token: string) => {
  try {
    const res = await api.post(
      `/event/events/${eventId}/products`,
      { products: productIds },
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

// Remove products from event
export const removeProductsFromEvent = async (eventId: string, productIds: string[], token: string) => {
  try {
    const res = await api.delete(
      `/event/events/${eventId}/products`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { products: productIds }
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

