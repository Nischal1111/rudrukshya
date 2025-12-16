"use client";

import { useState, useEffect } from "react";
import { getQRCodesForClient, type PersonalInfo } from "@/services/personal-info";
import Image from "next/image";
import Loader from "../Loader";

/**
 * Client-side component to display QR codes in bank transfer section
 * Use this component in your client repo's checkout/payment page
 */
export default function QRDisplayClient() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true);
        const data = await getQRCodesForClient();
        setPersonalInfo(data);
      } catch (err: any) {
        console.error("Error fetching QR codes:", err);
        setError(err?.message || "Failed to fetch QR codes");
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load payment information</p>
      </div>
    );
  }

  if (!personalInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* eSewa QR Section */}
      {personalInfo.esewaQR?.qrCodeUrl && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">eSewa Payment</h3>
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
              <Image
                src={personalInfo.esewaQR.qrCodeUrl}
                alt="eSewa QR Code"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 italic">For Nepali clients</p>
          </div>
        </div>
      )}

      {/* Khalti QR Section */}
      {personalInfo.khaltiQR?.qrCodeUrl && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Khalti Payment</h3>
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
              <Image
                src={personalInfo.khaltiQR.qrCodeUrl}
                alt="Khalti QR Code"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 italic">For Nepali clients</p>
          </div>
        </div>
      )}

      {/* FonePay QR Section */}
      {personalInfo.fonepayQR?.qrCodeUrl && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">FonePay Payment</h3>
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
              <Image
                src={personalInfo.fonepayQR.qrCodeUrl}
                alt="FonePay QR Code"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 italic">For Nepali clients</p>
          </div>
        </div>
      )}

      {/* Bank QR Section */}
      {personalInfo.bankQRs && personalInfo.bankQRs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Transfer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalInfo.bankQRs.map((bankQR, index) => (
              <div
                key={bankQR._id || index}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {bankQR.qrCodeUrl && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-48 h-48 border border-gray-300 rounded-md overflow-hidden bg-white p-2">
                      <Image
                        src={bankQR.qrCodeUrl}
                        alt={`${bankQR.bankName} QR Code`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      For Nepali clients and international clients
                    </p>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t border-gray-200">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!personalInfo.fonepayQR?.qrCodeUrl &&
        (!personalInfo.bankQRs || personalInfo.bankQRs.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No payment QR codes available</p>
          </div>
        )}
    </div>
  );
}

