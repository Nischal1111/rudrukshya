import api, { axios } from "./api";

export const getAllCategories = async () => {
  try {
    const res = await api.get(
      `/category/get`
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

export const createSubCategory = async (id: string, name: string, token: string) => {
  try {
    const res = await api.post(
      `/category/create/subCategory/${id}`,
      { name: name },
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

export const deleteSubCategory = async (id: string, token: string) => {
  try {
    const res = await api.patch(
      `/category/delete/${id}`,
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

export const createSubCategoryByName = async (categoryName: string, name: string, token: string) => {
  try {
    const res = await api.post(
      `/category/create/subCategory/byName/${categoryName}`,
      { name: name },
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
