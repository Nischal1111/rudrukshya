import api, { axios } from "./api";

export const getContacts = async (token: string) => {
  try {
    const res = await api.get(
      `/contact`,
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

export const getContactById = async (id: string, token: string) => {
  try {
    const res = await api.get(
      `/contact/${id}`,
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

export const createContact = async (data: { location: string; phone: string; email: string }, token: string) => {
  try {
    // Ensure data is properly formatted
    const payload = {
      location: String(data.location || "").trim(),
      phone: String(data.phone || "").trim(),
      email: String(data.email || "").trim(),
    };

    // Validate payload before sending
    if (!payload.location || !payload.phone || !payload.email) {
      throw new Error("All fields (location, phone, email) are required");
    }

    console.log("Creating contact with payload:", payload);
    const res = await api.post(
      `/contact`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error creating contact:", err.response?.data);
      console.error("Request payload was:", data);
      // Preserve the axios error so response data can be accessed
      throw err;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateContact = async (id: string, data: { location: string; phone: string; email: string }, token: string) => {
  try {
    // Ensure data is properly formatted
    const payload = {
      location: String(data.location || "").trim(),
      phone: String(data.phone || "").trim(),
      email: String(data.email || "").trim(),
    };

    // Validate payload before sending
    if (!payload.location || !payload.phone || !payload.email) {
      throw new Error("All fields (location, phone, email) are required");
    }

    console.log("Updating contact with ID:", id, "payload:", payload);
    const res = await api.put(
      `/contact/${id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error updating contact:", err.response?.data);
      console.error("Request payload was:", data);
      // Preserve the axios error so response data can be accessed
      throw err;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const deleteContact = async (id: string, token: string) => {
  try {
    const res = await api.delete(
      `/contact/${id}`,
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

// Submit contact form (public endpoint, no token required)
export const submitContactForm = async (data: { name: string; email: string; phone?: string; message: string }) => {
  try {
    const payload = {
      name: String(data.name || "").trim(),
      email: String(data.email || "").trim(),
      phone: data.phone ? String(data.phone).trim() : "",
      message: String(data.message || "").trim(),
    };

    // Validate required fields
    if (!payload.name || !payload.email || !payload.message) {
      throw new Error("Name, email, and message are required");
    }

    const res = await api.post(
      `/contact/submit`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || err.message;
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

