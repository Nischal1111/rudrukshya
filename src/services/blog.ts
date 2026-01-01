import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Backend routes (mounted at /blog):
// GET    /blog/Blogs
// GET    /blog/posts/:id
// POST   /blog/posts
// PUT    /blog/posts/:id
// DELETE /blog/posts/:id
export const getBlogs = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await axios.get(`${BASE_URL}/blog/Blogs?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getBlogById = async (id: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/blog/posts/${id}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const createBlog = async (data: FormData | { title: string; content: string; author?: string; image?: string; imageUrl?: string }, token: string) => {
  try {
    let res;

    if (data instanceof FormData) {
      // Log what we're sending (without logging the actual file content)
      const formDataEntries: Record<string, any> = {};
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes]`;
        } else {
          formDataEntries[key] = typeof value === 'string' && value.length > 100
            ? value.substring(0, 100) + '...'
            : value;
        }
      }
      console.log("Creating blog with FormData:", formDataEntries);

      res = await axios.post(`${BASE_URL}/blog/posts`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      console.log("Creating blog with JSON:", { ...data, content: data.content.substring(0, 100) + '...' });

      res = await axios.post(`${BASE_URL}/blog/posts`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    console.log("Blog created successfully:", res.data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Blog creation error - Full error:", err);
      console.error("Blog creation error - Response data:", err.response?.data);
      console.error("Blog creation error - Response status:", err.response?.status);
      console.error("Blog creation error - Response headers:", err.response?.headers);

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "An error occurred while creating the blog.";
      const error = new Error(errorMessage);
      (error as any).response = err.response;
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateBlog = async (id: string, data: FormData | { title: string; content: string; author?: string; image?: string; imageUrl?: string }, token: string) => {
  try {
    let res;

    if (data instanceof FormData) {
      // Log what we're sending (without logging the actual file content)
      const formDataEntries: Record<string, any> = {};
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes]`;
        } else {
          formDataEntries[key] = typeof value === 'string' && value.length > 100
            ? value.substring(0, 100) + '...'
            : value;
        }
      }
      console.log("Updating blog with FormData:", formDataEntries);

      res = await axios.put(`${BASE_URL}/blog/posts/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      console.log("Updating blog with JSON:", { ...data, content: data.content.substring(0, 100) + '...' });

      res = await axios.put(`${BASE_URL}/blog/posts/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    console.log("Blog updated successfully:", res.data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Blog update error - Full error:", err);
      console.error("Blog update error - Response data:", err.response?.data);
      console.error("Blog update error - Response status:", err.response?.status);
      
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.response?.data?.msg || 
        err.message || 
        "An error occurred while updating the blog.";
      
      const error = new Error(errorMessage);
      (error as any).response = err.response;
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
};

export const deleteBlog = async (id: string, token: string) => {
  try {
    const res = await axios.delete(`${BASE_URL}/blog/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
