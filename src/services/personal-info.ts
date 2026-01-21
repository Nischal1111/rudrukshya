import api, { axios } from "./api";

export interface BankQR {
  _id?: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface FonePayQR {
  _id?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface EsewaQR {
  _id?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface KhaltiQR {
  _id?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface IndiaQR {
  _id?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface IndiaBankQR {
  _id?: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode?: string;
  qrCode?: string;
  qrCodeUrl?: string;
}

export interface ShippingFees {
  insideKathmandu?: number;
  outsideKathmandu?: number;
  india?: number;
  otherInternational?: number;
}

export interface ShippingEstimates {
  insideKathmandu?: string;
  outsideKathmandu?: string;
  india?: string;
  otherInternational?: string;
}

export interface PersonalInfo {
  _id?: string;
  fonepayQR?: FonePayQR;
  esewaQR?: EsewaQR;
  khaltiQR?: KhaltiQR;
  bankQRs?: BankQR[];
  indiaQR?: IndiaQR;
  indiaBankQRs?: IndiaBankQR[];
  shippingFees?: ShippingFees;
  shippingEstimates?: ShippingEstimates;
}

export const getPersonalInfo = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/personal-info/get`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        return null;
      }
      throw new Error(err.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const createOrUpdatePersonalInfo = async (data: {
  fonepayQR?: File;
  bankQRs?: Array<{
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    qrCode?: File;
  }>;
}, token: string) => {
  try {
    const formData = new FormData();

    if (data.fonepayQR) {
      formData.append("fonepayQR", data.fonepayQR);
    }

    if (data.bankQRs && data.bankQRs.length > 0) {
      data.bankQRs.forEach((bankQR, index) => {
        formData.append(`bankQRs[${index}][bankName]`, bankQR.bankName);
        formData.append(`bankQRs[${index}][accountNumber]`, bankQR.accountNumber);
        formData.append(`bankQRs[${index}][accountHolderName]`, bankQR.accountHolderName);
        if (bankQR.qrCode) {
          formData.append(`bankQRs[${index}][qrCode]`, bankQR.qrCode);
        }
      });
    }

    const res = await api.post(
      `/personal-info/create-or-update`,
      formData,
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

export const updateFonePayQR = async (qrCode: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("fonepayQR", qrCode);

    const res = await api.post(
      `/personal-info/fonepay-qr`,
      formData,
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
      console.error("FonePay QR update error:", err.response?.data);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update FonePay QR";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const addBankQR = async (data: {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  qrCode?: File;
}, token: string) => {
  try {
    const formData = new FormData();
    formData.append("bankName", data.bankName);
    formData.append("accountNumber", data.accountNumber);
    formData.append("accountHolderName", data.accountHolderName);
    if (data.swiftCode) {
      formData.append("swiftCode", data.swiftCode);
    }
    if (data.qrCode) {
      formData.append("qrCode", data.qrCode);
    }

    const res = await api.post(
      `/personal-info/bank-qr`,
      formData,
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

export const updateBankQR = async (id: string, data: {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  swiftCode?: string;
  qrCode?: File;
}, token: string) => {
  try {
    const formData = new FormData();
    if (data.bankName) formData.append("bankName", data.bankName);
    if (data.accountNumber) formData.append("accountNumber", data.accountNumber);
    if (data.accountHolderName) formData.append("accountHolderName", data.accountHolderName);
    if (data.swiftCode !== undefined) formData.append("swiftCode", data.swiftCode || "");
    if (data.qrCode) formData.append("qrCode", data.qrCode);

    const res = await api.put(
      `/personal-info/bank-qr/${id}`,
      formData,
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

export const deleteBankQR = async (id: string, token: string) => {
  try {
    const res = await api.delete(
      `/personal-info/bank-qr/${id}`,
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

// Update eSewa QR
export const updateEsewaQR = async (qrCode: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("esewaQR", qrCode);

    const res = await api.post(
      `/personal-info/esewa-qr`,
      formData,
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
      console.error("eSewa QR update error:", err.response?.data);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update eSewa QR";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Update Khalti QR
export const updateKhaltiQR = async (qrCode: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("khaltiQR", qrCode);

    const res = await api.post(
      `/personal-info/khalti-qr`,
      formData,
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
      console.error("Khalti QR update error:", err.response?.data);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update Khalti QR";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Client-side function to fetch QR codes for bank transfer section
export const getQRCodesForClient = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/personal-info/get`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        return null;
      }
      throw new Error(err.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Update shipping fees
export const updateShippingFees = async (fees: {
  insideKathmandu: number;
  outsideKathmandu: number;
  india: number;
  otherInternational: number;
  estimatedDeliveryDays?: ShippingEstimates;
}, token: string) => {
  try {
    const res = await api.put(
      `/personal-info/shipping-fees`,
      fees,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update shipping fees";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Update India QR
export const updateIndiaQR = async (qrCode: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("indiaQR", qrCode);

    const res = await api.post(
      `/personal-info/india-qr`,
      formData,
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
      console.error("India QR update error:", err.response?.data);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update India QR";
      throw new Error(errorMessage);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Add India Bank QR
export const addIndiaBankQR = async (data: {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode?: string;
  qrCode?: File;
}, token: string) => {
  try {
    const formData = new FormData();
    formData.append("bankName", data.bankName);
    formData.append("accountNumber", data.accountNumber);
    formData.append("accountHolderName", data.accountHolderName);
    if (data.ifscCode) {
      formData.append("ifscCode", data.ifscCode);
    }
    if (data.qrCode) {
      formData.append("qrCode", data.qrCode);
    }

    const res = await api.post(
      `/personal-info/india-bank-qr`,
      formData,
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

// Update India Bank QR
export const updateIndiaBankQR = async (id: string, data: {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  qrCode?: File;
}, token: string) => {
  try {
    const formData = new FormData();
    if (data.bankName) formData.append("bankName", data.bankName);
    if (data.accountNumber) formData.append("accountNumber", data.accountNumber);
    if (data.accountHolderName) formData.append("accountHolderName", data.accountHolderName);
    if (data.ifscCode !== undefined) formData.append("ifscCode", data.ifscCode || "");
    if (data.qrCode) formData.append("qrCode", data.qrCode);

    const res = await api.put(
      `/personal-info/india-bank-qr/${id}`,
      formData,
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

// Delete India Bank QR
export const deleteIndiaBankQR = async (id: string, token: string) => {
  try {
    const res = await api.delete(
      `/personal-info/india-bank-qr/${id}`,
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

