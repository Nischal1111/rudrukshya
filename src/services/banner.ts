import axios from "axios";

export const getBanners = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/banner/get`
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

export const getBannerByName = async (name: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/banner/get/${name}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // If 404, return empty array instead of throwing error
      if (err.response?.status === 404) {
        return [];
      }
      throw new Error(err.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const createBanner = async (name: string, files: File[], youtubeLinks?: string[]) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    
    files.forEach((file) => {
      formData.append("thumbnails", file);
    });

    if (youtubeLinks && youtubeLinks.length > 0) {
      youtubeLinks.forEach((link) => {
        formData.append("youtubeLinks", link);
      });
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/banner/create`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
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

export const updateBanner = async (name: string, files: File[], youtubeLinks?: string[]) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    
    files.forEach((file) => {
      formData.append("thumbnails", file);
    });

    if (youtubeLinks && youtubeLinks.length > 0) {
      youtubeLinks.forEach((link) => {
        formData.append("youtubeLinks", link);
      });
    }

    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/banner/update`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
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

export const deleteBannerImage = async (name: string, imageUrl: string) => {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/banner/delete`,
      {
        data: { name, imageUrl },
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

