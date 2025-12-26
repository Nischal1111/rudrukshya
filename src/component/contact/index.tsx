"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEdit, FaSave } from "react-icons/fa";
import { getContacts, createContact, updateContact } from "@/services/contact";
import Loader from "../Loader";
import { toast } from "sonner";

interface Contact {
  _id?: string;
  location: string;
  phone: string;
  email: string;
}

export default function ContactManagement() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    location: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs to access input values directly as fallback
  const locationRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContacts(token);
      const contacts = Array.isArray(data) ? data : [];

      if (contacts.length > 0) {
        // Get the first contact
        const firstContact = contacts[0];
        setContact(firstContact);
        setFormData({
          location: firstContact.location || "",
          phone: firstContact.phone || "",
          email: firstContact.email || "",
        });
      } else {
        // No contact exists yet
        setContact(null);
        setFormData({
          location: "",
          phone: "",
          email: "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching contact:", err);
      setError(err?.message || "Failed to fetch contact");
      toast.error("Failed to fetch contact");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  // Debug: Log formData changes
  useEffect(() => {
    if (isEditing) {
      console.log("Form data updated:", formData);
    }
  }, [formData, isEditing]);

  const handleSave = async () => {
    // Get values from state, with fallback to refs if state is somehow empty
    const locationValue = formData.location || locationRef.current?.value || "";
    const phoneValue = formData.phone || phoneRef.current?.value || "";
    const emailValue = formData.email || emailRef.current?.value || "";

    // Ensure all fields are strings and trim them
    const trimmedData = {
      location: String(locationValue).trim(),
      phone: String(phoneValue).trim(),
      email: String(emailValue).trim(),
    };

    // Validate all fields are filled
    if (!trimmedData.location || !trimmedData.phone || !trimmedData.email) {
      toast.error("Please fill in all fields");
      console.error("Validation failed - missing fields:", {
        location: trimmedData.location,
        phone: trimmedData.phone,
        email: trimmedData.email,
        formData,
        refs: {
          location: locationRef.current?.value,
          phone: phoneRef.current?.value,
          email: emailRef.current?.value,
        }
      });
      return;
    }

    // Debug: Log what we're sending
    console.log("Saving contact data:", trimmedData);
    console.log("Contact ID:", contact?._id);
    console.log("Form data state:", formData);

    setIsSubmitting(true);
    try {
      if (contact?._id) {
        // Update existing contact
        console.log("Updating contact with ID:", contact._id);
        await updateContact(contact._id, trimmedData, token);
        toast.success("Contact updated successfully");
      } else {
        // Create new contact
        console.log("Creating new contact");
        await createContact(trimmedData, token);
        toast.success("Contact created successfully");
      }
      setIsEditing(false);
      await fetchContact();
    } catch (err: any) {
      console.error("Error saving contact:", err);
      console.error("Error response:", err?.response?.data);
      // Handle axios error response
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save contact";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (contact) {
      // Reset to original values
      setFormData({
        location: contact.location || "",
        phone: contact.phone || "",
        email: contact.email || "",
      });
    } else {
      // Reset to empty
      setFormData({
        location: "",
        phone: "",
        email: "",
      });
    }
    setIsEditing(false);
  };

  if (loading) return <Loader />;
  if (error && !contact) {
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contact Details</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primaryColor hover:bg-primaryColor/90 text-white"
            >
              <FaEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    ref={locationRef}
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("Location onChange:", value);
                      setFormData({ ...formData, location: value });
                    }}
                    className="w-full"
                  />
                ) : (
                  <div className="p-2 text-gray-900 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                    {contact?.location || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    ref={phoneRef}
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("Phone onChange:", value);
                      setFormData({ ...formData, phone: value });
                    }}
                    className="w-full"
                  />
                ) : (
                  <div className="p-2 text-gray-900 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                    {contact?.phone || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("Email onChange:", value);
                      setFormData({ ...formData, email: value });
                    }}
                    className="w-full"
                  />
                ) : (
                  <div className="p-2 text-gray-900 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                    {contact?.email || "Not set"}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primaryColor hover:bg-primaryColor/90 text-white"
                  disabled={isSubmitting}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
