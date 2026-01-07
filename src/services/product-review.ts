import api, { axios } from "./api";

// Get reviews for a specific product
export const getProductReviews = async (productId: string, page: number = 1, limit: number = 10) => {
  try {
    const res = await api.get(
      `/product/${productId}/review/get?page=${page}&limit=${limit}`
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

// Create a review for a product (admin can create reviews on behalf of users)
export const createProductReview = async (productId: string, data: { rating: number; reviewerName?: string; commentTitle: string; comment: string }, token: string) => {
  try {
    const res = await api.post(
      `/product/${productId}/review/create`,
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

// Update a product review
export const updateProductReview = async (
  productId: string,
  reviewId: string,
  data: { rating?: number; reviewerName?: string; commentTitle?: string; comment?: string },
  token: string
) => {
  try {
    const res = await api.put(
      `/product/${productId}/review/update/${reviewId}`,
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

// Delete a product review
export const deleteProductReview = async (productId: string, reviewId: string, token: string) => {
  try {
    const res = await api.delete(
      `/product/${productId}/review/delete/${reviewId}`,
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

