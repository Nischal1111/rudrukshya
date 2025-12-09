import axios from "axios";

export const getContacts = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contact`
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

export const getContactById = async (id: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`
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

export const createContact = async (data: { location: string; phone: string; email: string }) => {
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
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
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
      console.error("Axios error creating contact:", err.response?.data);
      console.error("Request payload was:", data);
      // Preserve the axios error so response data can be accessed
      throw err;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateContact = async (id: string, data: { location: string; phone: string; email: string }) => {
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
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`,
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
      console.error("Axios error updating contact:", err.response?.data);
      console.error("Request payload was:", data);
      // Preserve the axios error so response data can be accessed
      throw err;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const deleteContact = async (id: string) => {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`
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

