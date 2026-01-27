"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEdit, FaSave, FaTrash, FaPlus } from "react-icons/fa";
import {
  getPersonalInfo,
  updateFonePayQR,
  updateEsewaQR,
  updateKhaltiQR,
  addBankQR,
  updateBankQR,
  deleteBankQR,
  updateIndiaQR,
  type PersonalInfo,
  type BankQR,
} from "@/services/personal-info";
import Loader from "../Loader";
import { toast } from "sonner";
import Image from "next/image";

export default function PersonalInfoManagement() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingFonePay, setIsEditingFonePay] = useState(false);
  const [isEditingEsewa, setIsEditingEsewa] = useState(false);
  const [isEditingKhalti, setIsEditingKhalti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FonePay QR state
  const [fonepayQRFile, setFonepayQRFile] = useState<File | null>(null);
  const [fonepayQRPreview, setFonepayQRPreview] = useState<string | null>(null);
  const fonepayQRInputRef = useRef<HTMLInputElement>(null);

  // eSewa QR state
  const [esewaQRFile, setEsewaQRFile] = useState<File | null>(null);
  const [esewaQRPreview, setEsewaQRPreview] = useState<string | null>(null);
  const esewaQRInputRef = useRef<HTMLInputElement>(null);

  // Khalti QR state
  const [khaltiQRFile, setKhaltiQRFile] = useState<File | null>(null);
  const [khaltiQRPreview, setKhaltiQRPreview] = useState<string | null>(null);
  const khaltiQRInputRef = useRef<HTMLInputElement>(null);

  // Bank QR states
  const [editingBankIndex, setEditingBankIndex] = useState<number | null>(null);
  const [bankQRForms, setBankQRForms] = useState<Array<{
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    swiftCode?: string;
    qrCodeFile?: File | null;
    qrCodePreview?: string | null;
  }>>([]);

  // India QR state
  const [isEditingIndiaQR, setIsEditingIndiaQR] = useState(false);
  const [indiaQRFile, setIndiaQRFile] = useState<File | null>(null);
  const [indiaQRPreview, setIndiaQRPreview] = useState<string | null>(null);
  const indiaQRInputRef = useRef<HTMLInputElement>(null);

  // India Bank QR states (removed UI, keep empty)
  const [editingIndiaBankIndex] = useState<number | null>(null);

  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchPersonalInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonalInfo();

      if (data) {
        setPersonalInfo(data);
        if (data.fonepayQR?.qrCodeUrl) {
          setFonepayQRPreview(data.fonepayQR.qrCodeUrl);
        }
        if (data.esewaQR?.qrCodeUrl) {
          setEsewaQRPreview(data.esewaQR.qrCodeUrl);
        }
        if (data.khaltiQR?.qrCodeUrl) {
          setKhaltiQRPreview(data.khaltiQR.qrCodeUrl);
        }

        // Initialize bank QR forms
        if (data.bankQRs && data.bankQRs.length > 0) {
          setBankQRForms(
            data.bankQRs.map((bankQR: BankQR) => ({
              bankName: bankQR.bankName || "",
              accountNumber: bankQR.accountNumber || "",
              accountHolderName: bankQR.accountHolderName || "",
              swiftCode: bankQR.swiftCode || "",
              qrCodeFile: null,
              qrCodePreview: bankQR.qrCodeUrl || null,
            }))
          );
        } else {
          setBankQRForms([]);
        }

        // Initialize India QR
        if (data.indiaQR?.qrCodeUrl) {
          setIndiaQRPreview(data.indiaQR.qrCodeUrl);
        }

        // India bank details are no longer editable from admin UI
      } else {
        setPersonalInfo(null);
        setBankQRForms([]);
        // India bank details are no longer editable from admin UI
      }
    } catch (err: any) {
      console.error("Error fetching personal info:", err);
      setError(err?.message || "Failed to fetch personal info");
      toast.error("Failed to fetch personal info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const handleFonePayQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFonepayQRFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFonepayQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFonePayQR = async () => {
    if (!fonepayQRFile && !personalInfo?.fonepayQR) {
      toast.error("Please select a QR code image");
      return;
    }

    if (!fonepayQRFile) {
      setIsEditingFonePay(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFonePayQR(fonepayQRFile, token);
      toast.success("FonePay QR updated successfully");
      setIsEditingFonePay(false);
      setFonepayQRFile(null);
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error updating FonePay QR:", err);
      toast.error(err?.message || "Failed to update FonePay QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelFonePayQR = () => {
    setFonepayQRFile(null);
    if (personalInfo?.fonepayQR?.qrCodeUrl) {
      setFonepayQRPreview(personalInfo.fonepayQR.qrCodeUrl);
    } else {
      setFonepayQRPreview(null);
    }
    setIsEditingFonePay(false);
  };

  // eSewa QR handlers
  const handleEsewaQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEsewaQRFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEsewaQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEsewaQR = async () => {
    if (!esewaQRFile && !personalInfo?.esewaQR) {
      toast.error("Please select a QR code image");
      return;
    }

    if (!esewaQRFile) {
      setIsEditingEsewa(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEsewaQR(esewaQRFile, token);
      toast.success("eSewa QR updated successfully");
      setIsEditingEsewa(false);
      setEsewaQRFile(null);
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error updating eSewa QR:", err);
      toast.error(err?.message || "Failed to update eSewa QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEsewaQR = () => {
    setEsewaQRFile(null);
    if (personalInfo?.esewaQR?.qrCodeUrl) {
      setEsewaQRPreview(personalInfo.esewaQR.qrCodeUrl);
    } else {
      setEsewaQRPreview(null);
    }
    setIsEditingEsewa(false);
  };

  // Khalti QR handlers
  const handleKhaltiQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKhaltiQRFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKhaltiQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveKhaltiQR = async () => {
    if (!khaltiQRFile && !personalInfo?.khaltiQR) {
      toast.error("Please select a QR code image");
      return;
    }

    if (!khaltiQRFile) {
      setIsEditingKhalti(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateKhaltiQR(khaltiQRFile, token);
      toast.success("Khalti QR updated successfully");
      setIsEditingKhalti(false);
      setKhaltiQRFile(null);
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error updating Khalti QR:", err);
      toast.error(err?.message || "Failed to update Khalti QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelKhaltiQR = () => {
    setKhaltiQRFile(null);
    if (personalInfo?.khaltiQR?.qrCodeUrl) {
      setKhaltiQRPreview(personalInfo.khaltiQR.qrCodeUrl);
    } else {
      setKhaltiQRPreview(null);
    }
    setIsEditingKhalti(false);
  };

  const handleAddBankQR = () => {
    if (bankQRForms.length >= 3) {
      toast.error("You can only add up to 3 bank QR codes");
      return;
    }
    setBankQRForms([
      ...bankQRForms,
      {
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        swiftCode: "",
        qrCodeFile: null,
        qrCodePreview: null,
      },
    ]);
    setEditingBankIndex(bankQRForms.length);
  };

  const handleBankQRFormChange = (
    index: number,
    field: string,
    value: string | File | null
  ) => {
    const updatedForms = [...bankQRForms];
    if (field === "qrCodeFile" && value instanceof File) {
      updatedForms[index].qrCodeFile = value;
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedForms[index].qrCodePreview = reader.result as string;
        setBankQRForms([...updatedForms]);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === "string") {
      updatedForms[index] = {
        ...updatedForms[index],
        [field]: value,
      };
    }
    setBankQRForms(updatedForms);
  };

  const handleSaveBankQR = async (index: number) => {
    const form = bankQRForms[index];
    if (!form.bankName || !form.accountNumber || !form.accountHolderName) {
      toast.error("Please fill in all bank details");
      return;
    }

    const bankQR = personalInfo?.bankQRs?.[index];
    setIsSubmitting(true);
    try {
      if (bankQR?._id) {
        // Update existing
        await updateBankQR(bankQR._id, {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountHolderName: form.accountHolderName,
          swiftCode: form.swiftCode || undefined,
          qrCode: form.qrCodeFile || undefined,
        }, token);
        toast.success("Bank QR updated successfully");
      } else {
        // Add new - QR code is optional
        await addBankQR({
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountHolderName: form.accountHolderName,
          swiftCode: form.swiftCode || undefined,
          qrCode: form.qrCodeFile || undefined,
        }, token);
        toast.success("Bank QR added successfully");
      }
      setEditingBankIndex(null);
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error saving bank QR:", err);
      toast.error(err?.message || "Failed to save bank QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBankQR = async (index: number) => {
    const bankQR = personalInfo?.bankQRs?.[index];
    if (!bankQR?._id) {
      // Remove from form if not saved yet
      const updatedForms = bankQRForms.filter((_, i) => i !== index);
      setBankQRForms(updatedForms);
      setEditingBankIndex(null);
      return;
    }

    if (!confirm("Are you sure you want to delete this bank QR?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteBankQR(bankQR._id, token);
      toast.success("Bank QR deleted successfully");
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error deleting bank QR:", err);
      toast.error(err?.message || "Failed to delete bank QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBankQR = (index: number) => {
    const bankQR = personalInfo?.bankQRs?.[index];
    if (bankQR) {
      // Reset to original values
      const updatedForms = [...bankQRForms];
      updatedForms[index] = {
        bankName: bankQR.bankName || "",
        accountNumber: bankQR.accountNumber || "",
        accountHolderName: bankQR.accountHolderName || "",
        swiftCode: bankQR.swiftCode || "",
        qrCodeFile: null,
        qrCodePreview: bankQR.qrCodeUrl || null,
      };
      setBankQRForms(updatedForms);
    } else {
      // Remove unsaved form
      const updatedForms = bankQRForms.filter((_, i) => i !== index);
      setBankQRForms(updatedForms);
    }
    setEditingBankIndex(null);
  };

  // India QR handlers
  const handleIndiaQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIndiaQRFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIndiaQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIndiaQR = async () => {
    if (!indiaQRFile && !personalInfo?.indiaQR) {
      toast.error("Please select a QR code image");
      return;
    }

    if (!indiaQRFile) {
      setIsEditingIndiaQR(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateIndiaQR(indiaQRFile, token);
      toast.success("India QR updated successfully");
      setIsEditingIndiaQR(false);
      setIndiaQRFile(null);
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error updating India QR:", err);
      toast.error(err?.message || "Failed to update India QR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelIndiaQR = () => {
    setIndiaQRFile(null);
    if (personalInfo?.indiaQR?.qrCodeUrl) {
      setIndiaQRPreview(personalInfo.indiaQR.qrCodeUrl);
    } else {
      setIndiaQRPreview(null);
    }
    setIsEditingIndiaQR(false);
  };

  // India Bank QR handlers have been removed from UI (bank details reused from international)

  if (loading) return <Loader />;
  if (error && !personalInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Personal Info</h1>

        {/* FonePay QR Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">FonePay QR</h2>
            {!isEditingFonePay && (
              <Button
                onClick={() => setIsEditingFonePay(true)}
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                <FaEdit className="mr-2 h-4 w-4" />
                {personalInfo?.fonepayQR ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {isEditingFonePay ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fonepayQR" className="text-sm font-medium text-gray-700">
                  QR Code Image
                </Label>
                <Input
                  ref={fonepayQRInputRef}
                  id="fonepayQR"
                  type="file"
                  accept="image/*"
                  onChange={handleFonePayQRChange}
                  className="mt-2"
                />
              </div>
              {fonepayQRPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={fonepayQRPreview}
                      alt="FonePay QR Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancelFonePayQR}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFonePayQR}
                  className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                  disabled={isSubmitting}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {fonepayQRPreview ? (
                <div className="space-y-2">
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={fonepayQRPreview}
                      alt="FonePay QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 italic">For Nepali clients</p>
                </div>
              ) : (
                <p className="text-gray-500">No FonePay QR code added yet</p>
              )}
            </div>
          )}
        </div>

        {/* eSewa QR Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">eSewa QR</h2>
            {!isEditingEsewa && (
              <Button
                onClick={() => setIsEditingEsewa(true)}
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                <FaEdit className="mr-2 h-4 w-4" />
                {personalInfo?.esewaQR ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {isEditingEsewa ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="esewaQR" className="text-sm font-medium text-gray-700">
                  QR Code Image
                </Label>
                <Input
                  ref={esewaQRInputRef}
                  id="esewaQR"
                  type="file"
                  accept="image/*"
                  onChange={handleEsewaQRChange}
                  className="mt-2"
                />
              </div>
              {esewaQRPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={esewaQRPreview}
                      alt="eSewa QR Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancelEsewaQR}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEsewaQR}
                  className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                  disabled={isSubmitting}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {esewaQRPreview ? (
                <div className="space-y-2">
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={esewaQRPreview}
                      alt="eSewa QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 italic">For Nepali clients</p>
                </div>
              ) : (
                <p className="text-gray-500">No eSewa QR code added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Khalti QR Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Khalti QR</h2>
            {!isEditingKhalti && (
              <Button
                onClick={() => setIsEditingKhalti(true)}
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              >
                <FaEdit className="mr-2 h-4 w-4" />
                {personalInfo?.khaltiQR ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {isEditingKhalti ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="khaltiQR" className="text-sm font-medium text-gray-700">
                  QR Code Image
                </Label>
                <Input
                  ref={khaltiQRInputRef}
                  id="khaltiQR"
                  type="file"
                  accept="image/*"
                  onChange={handleKhaltiQRChange}
                  className="mt-2"
                />
              </div>
              {khaltiQRPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={khaltiQRPreview}
                      alt="Khalti QR Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancelKhaltiQR}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveKhaltiQR}
                  className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                  disabled={isSubmitting}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {khaltiQRPreview ? (
                <div className="space-y-2">
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={khaltiQRPreview}
                      alt="Khalti QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 italic">For Nepali clients</p>
                </div>
              ) : (
                <p className="text-gray-500">No Khalti QR code added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Bank QR Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bank QR Codes</h2>
              <p className="text-sm text-gray-500 mt-1">Add up to 3 bank accounts with QR codes</p>
            </div>
            {editingBankIndex === null && bankQRForms.length < 3 && (
              <Button
                onClick={handleAddBankQR}
                className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                size="lg"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Bank QR
              </Button>
            )}
            {bankQRForms.length >= 3 && (
              <p className="text-sm text-gray-500">Maximum 3 bank QR codes reached</p>
            )}
          </div>

          <div className="space-y-6">
            {bankQRForms.map((form, index) => {
              const isEditing = editingBankIndex === index;
              const bankQR = personalInfo?.bankQRs?.[index];

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800">
                      Bank QR {index + 1}
                    </h3>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingBankIndex(index)}
                          variant="outline"
                          size="sm"
                        >
                          <FaEdit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteBankQR(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="mr-2 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Bank Name
                          </Label>
                          <Input
                            value={form.bankName}
                            onChange={(e) =>
                              handleBankQRFormChange(index, "bankName", e.target.value)
                            }
                            placeholder="Enter bank name"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Account Number
                          </Label>
                          <Input
                            value={form.accountNumber}
                            onChange={(e) =>
                              handleBankQRFormChange(
                                index,
                                "accountNumber",
                                e.target.value
                              )
                            }
                            placeholder="Enter account number"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Account Holder Name
                          </Label>
                          <Input
                            value={form.accountHolderName}
                            onChange={(e) =>
                              handleBankQRFormChange(
                                index,
                                "accountHolderName",
                                e.target.value
                              )
                            }
                            placeholder="Enter account holder name"
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Swift Code (Optional)
                        </Label>
                        <Input
                          value={form.swiftCode || ""}
                          onChange={(e) =>
                            handleBankQRFormChange(
                              index,
                              "swiftCode",
                              e.target.value
                            )
                          }
                          placeholder="Enter SWIFT code (e.g., NARBNPKAXXX)"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          QR Code Image
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleBankQRFormChange(index, "qrCodeFile", file);
                            }
                          }}
                          className="mt-2"
                        />
                      </div>
                      {form.qrCodePreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                            <Image
                              src={form.qrCodePreview}
                              alt={`Bank QR ${index + 1} Preview`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => handleCancelBankQR(index)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSaveBankQR(index)}
                          className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                          disabled={isSubmitting}
                        >
                          <FaSave className="mr-2 h-4 w-4" />
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <p className="font-medium">{form.bankName || "Not set"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium">{form.accountNumber || "Not set"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Account Holder Name</p>
                        <p className="font-medium">
                          {form.accountHolderName || "Not set"}
                        </p>
                      </div>
                      {form.swiftCode && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Swift Code</p>
                          <p className="font-medium">{form.swiftCode}</p>
                        </div>
                      )}
                      {form.qrCodePreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">QR Code</p>
                          <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                            <Image
                              src={form.qrCodePreview}
                              alt={`Bank QR ${index + 1}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            For Nepali clients and international clients
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {bankQRForms.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No bank QR codes added yet. Click "Add Bank QR" to add one.
              </p>
            )}
          </div>
        </div>

        {/* India UPI QR Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">India UPI QR</h2>
              <p className="text-sm text-gray-500 mt-1">For Indian clients paying via UPI</p>
            </div>
            {!isEditingIndiaQR && (
              <Button
                onClick={() => setIsEditingIndiaQR(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <FaEdit className="mr-2 h-4 w-4" />
                {personalInfo?.indiaQR ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {isEditingIndiaQR ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="indiaQR" className="text-sm font-medium text-gray-700">
                  UPI QR Code Image
                </Label>
                <Input
                  ref={indiaQRInputRef}
                  id="indiaQR"
                  type="file"
                  accept="image/*"
                  onChange={handleIndiaQRChange}
                  className="mt-2"
                />
              </div>
              {indiaQRPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={indiaQRPreview}
                      alt="India UPI QR Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancelIndiaQR}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveIndiaQR}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isSubmitting}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {indiaQRPreview ? (
                <div className="space-y-2">
                  <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={indiaQRPreview}
                      alt="India UPI QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 italic">For Indian clients</p>
                </div>
              ) : (
                <p className="text-gray-500">No India UPI QR code added yet</p>
              )}
            </div>
          )}
        </div>

        {/* India Bank QR Section removed: India bank transfers use same international bank details */}
      </div>
    </div>
  );
}

