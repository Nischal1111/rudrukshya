"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaSave } from "react-icons/fa";
import { getPersonalInfo, updateShippingFees, type PersonalInfo } from "@/services/personal-info";
import Loader from "../Loader";
import { toast } from "sonner";

interface ShippingFees {
  insideKathmandu: number;
  outsideKathmandu: number;
  india: number;
  otherInternational: number;
}

interface ShippingEstimates {
  insideKathmandu: string;
  outsideKathmandu: string;
  india: string;
  otherInternational: string;
}

export default function ShippingInfoManagement() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingFees, setShippingFees] = useState<ShippingFees>({
    insideKathmandu: 0,
    outsideKathmandu: 0,
    india: 0,
    otherInternational: 0,
  });
  const [shippingEstimates, setShippingEstimates] = useState<ShippingEstimates>({
    insideKathmandu: "",
    outsideKathmandu: "",
    india: "",
    otherInternational: "",
  });
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchPersonalInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonalInfo();

      if (data) {
        setPersonalInfo(data);
        if (data.shippingFees) {
          setShippingFees({
            insideKathmandu: data.shippingFees.insideKathmandu || 0,
            outsideKathmandu: data.shippingFees.outsideKathmandu || 0,
            india: data.shippingFees.india || 0,
            otherInternational: data.shippingFees.otherInternational || 0,
          });
        }
        if (data.shippingEstimates) {
          setShippingEstimates({
            insideKathmandu: data.shippingEstimates.insideKathmandu || "",
            outsideKathmandu: data.shippingEstimates.outsideKathmandu || "",
            india: data.shippingEstimates.india || "",
            otherInternational: data.shippingEstimates.otherInternational || "",
          });
        }
      } else {
        setPersonalInfo(null);
      }
    } catch (err: any) {
      console.error("Error fetching personal info:", err);
      setError(err?.message || "Failed to fetch shipping info");
      toast.error("Failed to fetch shipping info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const handleInputChange = (field: keyof ShippingFees, value: string) => {
    const numValue = parseFloat(value) || 0;
    setShippingFees((prev) => ({
      ...prev,
      [field]: numValue >= 0 ? numValue : 0,
    }));
  };

  const handleEstimateChange = (field: keyof ShippingEstimates, value: string) => {
    setShippingEstimates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateShippingFees(
        {
          ...shippingFees,
          estimatedDeliveryDays: shippingEstimates,
        },
        token
      );
      toast.success("Shipping fees updated successfully");
      await fetchPersonalInfo();
    } catch (err: any) {
      console.error("Error updating shipping fees:", err);
      toast.error(err?.message || "Failed to update shipping fees");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Information</h1>
        <p className="text-gray-600">Manage transportation fees for different geographical locations</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Fees</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inside Kathmandu */}
            <div className="space-y-2">
              <Label htmlFor="insideKathmandu" className="text-sm font-medium text-gray-700">
                Inside Kathmandu Valley
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="insideKathmandu"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingFees.insideKathmandu}
                  onChange={(e) => handleInputChange("insideKathmandu", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">Shipping fee for orders within Kathmandu valley</p>
              <Input
                id="insideKathmanduEstimate"
                type="text"
                value={shippingEstimates.insideKathmandu}
                onChange={(e) => handleEstimateChange("insideKathmandu", e.target.value)}
                placeholder="e.g. 3-5 days"
              />
              <p className="text-xs text-gray-500">Estimated delivery time shown to customers</p>
            </div>

            {/* Outside Kathmandu (Overall Nepal) */}
            <div className="space-y-2">
              <Label htmlFor="outsideKathmandu" className="text-sm font-medium text-gray-700">
                Overall Nepal (Outside KTM)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="outsideKathmandu"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingFees.outsideKathmandu}
                  onChange={(e) => handleInputChange("outsideKathmandu", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">Shipping fee for orders outside Kathmandu valley in Nepal</p>
              <Input
                id="outsideKathmanduEstimate"
                type="text"
                value={shippingEstimates.outsideKathmandu}
                onChange={(e) => handleEstimateChange("outsideKathmandu", e.target.value)}
                placeholder="e.g. 5-7 days"
              />
              <p className="text-xs text-gray-500">Estimated delivery time shown to customers</p>
            </div>

            {/* India */}
            <div className="space-y-2">
              <Label htmlFor="india" className="text-sm font-medium text-gray-700">
                India
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="india"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingFees.india}
                  onChange={(e) => handleInputChange("india", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">Shipping fee for orders to India</p>
              <Input
                id="indiaEstimate"
                type="text"
                value={shippingEstimates.india}
                onChange={(e) => handleEstimateChange("india", e.target.value)}
                placeholder="e.g. 7-10 days"
              />
              <p className="text-xs text-gray-500">Estimated delivery time shown to customers</p>
            </div>

            {/* Other International Countries */}
            <div className="space-y-2">
              <Label htmlFor="otherInternational" className="text-sm font-medium text-gray-700">
                Other International Countries
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="otherInternational"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingFees.otherInternational}
                  onChange={(e) => handleInputChange("otherInternational", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">Shipping fee for orders to other international countries</p>
              <Input
                id="otherInternationalEstimate"
                type="text"
                value={shippingEstimates.otherInternational}
                onChange={(e) => handleEstimateChange("otherInternational", e.target.value)}
                placeholder="e.g. 10-15 days"
              />
              <p className="text-xs text-gray-500">Estimated delivery time shown to customers</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-primaryColor hover:bg-primaryColor/90 text-white"
              disabled={isSubmitting}
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Shipping Fees"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}






