"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { deleteConsultation, getConsultation } from "@/services/consultation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "../Loader";
import { MdOutlineEmail } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { FaRegMessage } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FiCalendar } from "react-icons/fi";
import { FiUser } from "react-icons/fi";

interface Consultation {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}

const Consultation = () => {
  const [consultations, setConsultations] = useState<Array<Consultation>>([]);
  const [nextDisable, setNextDisable] = useState(false);
  const [previousDisable, setPreviousDisable] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchData = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const data = await getConsultation(page, limit, token);
      setPage(data.currentPage);

      if (data.currentPage === data.totalPages) {
        setNextDisable(true);
      } else {
        setNextDisable(false);
      }

      if (data.currentPage === 1) {
        setPreviousDisable(true);
      } else {
        setPreviousDisable(false);
      }

      setConsultations(data?.consultation);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConsultation(id, token);
      fetchData(page, 12);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData(page, 12);
  }, []);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      {loading && <Loader />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultations.map((consultation, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 relative group"
            >
              {/* Delete Button */}
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-1 bg-red-50 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                      <MdClose className="text-xl" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the consultation request and remove the data from your
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(consultation._id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Card Header */}
              <div className="bg-primaryColor text-white p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Request #{index + 1}</h2>
                  <span className="flex items-center text-sm">
                    <FiCalendar className="mr-1" />
                    {formatDate(consultation.date)}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                {/* User Info */}
                <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                  <div className="bg-primaryColor bg-opacity-10 p-2 rounded-full mr-3">
                    <FiUser className="text-lg text-primaryColor" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{consultation.fullName}</h3>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="bg-blue-50 p-1.5 rounded-md mr-2">
                      <MdOutlineEmail className="text-blue-500" />
                    </div>
                    <span className="truncate">{consultation.email}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <div className="bg-green-50 p-1.5 rounded-md mr-2">
                      <CiPhone className="text-green-500" />
                    </div>
                    <span>{consultation.phone}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-50 p-1.5 rounded-md mr-2">
                      <FaRegMessage className="text-purple-500" />
                    </div>
                    <h3 className="font-medium text-gray-700">Message</h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mt-2">{consultation.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page - 1, 12)}
          disabled={previousDisable}
          className="flex items-center gap-1"
        >
          <BiChevronLeft className="text-lg" />
          Previous
        </Button>
        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium">
          Page {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page + 1, 12)}
          disabled={nextDisable}
          className="flex items-center gap-1"
        >
          Next
          <BiChevronRight className="text-lg" />
        </Button>
      </div>
    </>
  );
};

export default Consultation;