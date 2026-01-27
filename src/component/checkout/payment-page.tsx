"use client";

import { useState, useEffect } from "react";
import { getQRCodesForClient, type PersonalInfo } from "@/services/personal-info";
import Image from "next/image";
import Loader from "../Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PaymentLocation = "nepal" | "india" | "outside" | null;
type PaymentMethod = "esewa" | "khalti" | "fonepay" | "bank";

export default function PaymentPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLocation, setPaymentLocation] = useState<PaymentLocation>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("esewa");
  const [selectedIndiaTab, setSelectedIndiaTab] = useState<"qr" | "bank">("qr");
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    paymentMethod: "",
    transactionId: "",
    notes: "",
  });

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true);
        const data = await getQRCodesForClient();
        setPersonalInfo(data);
      } catch (err: any) {
        console.error("Error fetching QR codes:", err);
        setError(err?.message || "Failed to fetch payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", { ...formData, paymentLocation, selectedPaymentMethod });
    // You can add API call here to submit the order
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const paymentMethods: { id: PaymentMethod; label: string; available: boolean }[] = [
    { id: "esewa", label: "eSewa", available: !!personalInfo?.esewaQR?.qrCodeUrl },
    { id: "khalti", label: "Khalti", available: !!personalInfo?.khaltiQR?.qrCodeUrl },
    { id: "fonepay", label: "FonePay", available: !!personalInfo?.fonepayQR?.qrCodeUrl },
    { id: "bank", label: "Bank Transfer", available: !!(personalInfo?.bankQRs && personalInfo.bankQRs.length > 0) },
  ];

  const availableMethods = paymentMethods.filter((method) => method.available);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout & Payment</h1>

        {/* Location Selection */}
        {!paymentLocation && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Payment Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setPaymentLocation("nepal")}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paying from Nepal</h3>
                <p className="text-gray-600">All payment methods available</p>
              </button>
              <button
                onClick={() => setPaymentLocation("india")}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paying from India</h3>
                <p className="text-gray-600">Bank transfer</p>
              </button>
              <button
                onClick={() => setPaymentLocation("outside")}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paying from Outside Nepal</h3>
                <p className="text-gray-600">Bank transfer only</p>
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods and Form */}
        {paymentLocation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Payment Methods</h2>
                <button
                  onClick={() => setPaymentLocation(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change Location
                </button>
              </div>

              {paymentLocation === "nepal" && (
                <>
                  {/* Tabs for Nepal */}
                  <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                    {availableMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`px-4 py-2 font-medium transition-colors ${
                          selectedPaymentMethod === method.id
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {/* QR Code Display */}
                  <div className="mb-6">
                    {selectedPaymentMethod === "esewa" && personalInfo?.esewaQR?.qrCodeUrl && (
                      <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">eSewa QR Code</h3>
                        <div className="relative w-64 h-64 border border-gray-300 rounded-md overflow-hidden bg-white p-4">
                          <Image
                            src={personalInfo.esewaQR.qrCodeUrl}
                            alt="eSewa QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm text-gray-600">Scan to pay with eSewa</p>
                      </div>
                    )}

                    {selectedPaymentMethod === "khalti" && personalInfo?.khaltiQR?.qrCodeUrl && (
                      <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Khalti QR Code</h3>
                        <div className="relative w-64 h-64 border border-gray-300 rounded-md overflow-hidden bg-white p-4">
                          <Image
                            src={personalInfo.khaltiQR.qrCodeUrl}
                            alt="Khalti QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm text-gray-600">Scan to pay with Khalti</p>
                      </div>
                    )}

                    {selectedPaymentMethod === "fonepay" && personalInfo?.fonepayQR?.qrCodeUrl && (
                      <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">FonePay QR Code</h3>
                        <div className="relative w-64 h-64 border border-gray-300 rounded-md overflow-hidden bg-white p-4">
                          <Image
                            src={personalInfo.fonepayQR.qrCodeUrl}
                            alt="FonePay QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm text-gray-600">Scan to pay with FonePay</p>
                      </div>
                    )}

                    {selectedPaymentMethod === "bank" && personalInfo?.bankQRs && personalInfo.bankQRs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h3>
                        {personalInfo.bankQRs.map((bankQR, index) => (
                          <div key={bankQR._id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                            {bankQR.qrCodeUrl && (
                              <div className="flex flex-col items-center space-y-2 mb-3">
                                <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
                                  <Image
                                    src={bankQR.qrCodeUrl}
                                    alt={`${bankQR.bankName} QR Code`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500">Bank Name</p>
                                <p className="font-medium text-sm">{bankQR.bankName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Account Number</p>
                                <p className="font-medium text-sm">{bankQR.accountNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Account Holder</p>
                                <p className="font-medium text-sm">{bankQR.accountHolderName}</p>
                              </div>
                              {bankQR.swiftCode && (
                                <div>
                                  <p className="text-xs text-gray-500">SWIFT Code</p>
                                  <p className="font-medium text-sm">{bankQR.swiftCode}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {paymentLocation === "india" && (
                <div className="space-y-4">
                  {/* Tabs for India: UPI QR vs Bank Transfer */}
                  <div className="flex gap-4 mb-4 border-b border-gray-200">
                    <button
                      onClick={() => setSelectedIndiaTab("qr")}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        selectedIndiaTab === "qr"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      UPI QR
                    </button>
                    <button
                      onClick={() => setSelectedIndiaTab("bank")}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        selectedIndiaTab === "bank"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>

                  {/* India UPI QR */}
                  {selectedIndiaTab === "qr" && personalInfo?.indiaQR?.qrCodeUrl && (
                    <div className="flex flex-col items-center space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">India UPI QR</h3>
                      <div className="relative w-64 h-64 border border-gray-300 rounded-md overflow-hidden bg-white p-4">
                        <Image
                          src={personalInfo.indiaQR.qrCodeUrl}
                          alt="India UPI QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600">Scan to pay using UPI apps in India.</p>
                    </div>
                  )}
                  {selectedIndiaTab === "qr" && !personalInfo?.indiaQR?.qrCodeUrl && (
                    <p className="text-gray-500">No India UPI QR available. Please contact support.</p>
                  )}

                  {/* India Bank Transfer (same details as international bank transfer) */}
                  {selectedIndiaTab === "bank" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h3>
                      {personalInfo?.bankQRs && personalInfo.bankQRs.length > 0 ? (
                        personalInfo.bankQRs.map((bankQR, index) => (
                          <div key={bankQR._id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                            {bankQR.qrCodeUrl && (
                              <div className="flex flex-col items-center space-y-2 mb-3">
                                <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
                                  <Image
                                    src={bankQR.qrCodeUrl}
                                    alt={`${bankQR.bankName} QR Code`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500">Bank Name</p>
                                <p className="font-medium text-sm">{bankQR.bankName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Account Number</p>
                                <p className="font-medium text-sm">{bankQR.accountNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Account Holder</p>
                                <p className="font-medium text-sm">{bankQR.accountHolderName}</p>
                              </div>
                              {bankQR.swiftCode && (
                                <div>
                                  <p className="text-xs text-gray-500">SWIFT Code</p>
                                  <p className="font-medium text-sm">{bankQR.swiftCode}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No bank transfer details available</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {paymentLocation === "outside" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h3>
                  {personalInfo?.bankQRs && personalInfo.bankQRs.length > 0 ? (
                    personalInfo.bankQRs.map((bankQR, index) => (
                      <div key={bankQR._id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        {bankQR.qrCodeUrl && (
                          <div className="flex flex-col items-center space-y-2 mb-3">
                            <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
                              <Image
                                src={bankQR.qrCodeUrl}
                                alt={`${bankQR.bankName} QR Code`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Bank Name</p>
                            <p className="font-medium text-sm">{bankQR.bankName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Number</p>
                            <p className="font-medium text-sm">{bankQR.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Holder</p>
                            <p className="font-medium text-sm">{bankQR.accountHolderName}</p>
                          </div>
                          {bankQR.swiftCode && (
                            <div>
                              <p className="text-xs text-gray-500">SWIFT Code</p>
                              <p className="font-medium text-sm">{bankQR.swiftCode}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No bank transfer details available</p>
                  )}
                </div>
              )}
            </div>

            {/* Order Form Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="transactionId">Transaction ID / Reference Number *</Label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter transaction ID after payment"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Order
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

