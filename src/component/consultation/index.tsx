"use client";
import React from "react";
import { MdOutlineEmail } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { FaRegMessage } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { getConsultation } from "@/services/consultation";
import { Button } from "@/components/ui/button";

interface Consultation {
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
  const fetchData = async (page: number, limit: number) => {
    try {
      const data = await getConsultation(page, limit);
      console.log(data);
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
      console.log(data);
      setConsultations(data?.consultation);
    } catch (err: unknown) {}
  };
  useEffect(() => {
    fetchData(page, 12);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-9">
        {consultations.map((consultation, index) => {
          return (
            <div
              key={index}
              className="w-80 h-fit rounded-md bg-[#F2F7FB] p-6 flex flex-col gap-4"
            >
              <h1 className="font-bold">Request #{index}</h1>
              <div className="flex flex-col gap-1">
                <h1 className="font-semibold  ">{consultation.fullName}</h1>
                <p className="flex items-center gap-2">
                  <MdOutlineEmail />
                  {consultation.email}
                </p>
                <p className="flex items-center gap-2">
                  <CiPhone />
                  {consultation.phone}
                </p>
              </div>
              <ul className="border" />
              <div className="flex flex-col gap-1">
                <h1 className="font-semibold flex items-center gap-2">
                  <FaRegMessage size={13} />
                  Message
                </h1>
                <p>{consultation.message}</p>
              </div>
              <ul className="border" />
              <div>
                <p>{consultation.date}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page - 1, 12)}
          disabled={previousDisable}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page + 1, 12)}
          disabled={nextDisable}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Consultation;
