"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "@/services/faq";
import Loader from "../Loader";
import { toast } from "sonner";

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState<FAQ>({
    question: "",
    answer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFAQs();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      setError(err?.message || "Failed to fetch FAQs");
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleCreate = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFAQ(formData, token);
      toast.success("FAQ created successfully");
      setFormData({ question: "", answer: "" });
      setOpenDialog(false);
      await fetchFAQs();
    } catch (err: any) {
      console.error("Error creating FAQ:", err);
      toast.error(err?.response?.data?.message || "Failed to create FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFAQ(id, formData, token);
      toast.success("FAQ updated successfully");
      setFormData({ question: "", answer: "" });
      setOpenEditDialog(null);
      await fetchFAQs();
    } catch (err: any) {
      console.error("Error updating FAQ:", err);
      toast.error(err?.response?.data?.message || "Failed to update FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFAQ(id, token);
      toast.success("FAQ deleted successfully");
      await fetchFAQs();
    } catch (err: any) {
      console.error("Error deleting FAQ:", err);
      toast.error(err?.response?.data?.message || "Failed to delete FAQ");
    }
  };

  const openEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
    });
    setOpenEditDialog(faq._id || null);
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "" });
  };

  if (loading) return <Loader />;
  if (error && faqs.length === 0) {
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <Dialog
            open={openDialog}
            onOpenChange={(open) => {
              setOpenDialog(open);
              if (!open) {
                resetForm();
                setIsSubmitting(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primaryColor hover:bg-primaryColor/90 text-white">
                <FaPlus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New FAQ</DialogTitle>
                <DialogDescription>
                  Add a new frequently asked question and answer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="question" className="text-right font-medium pt-2">
                    Question
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="Enter the question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="answer" className="text-right font-medium pt-2">
                    Answer
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer"
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    className="col-span-3 min-h-[150px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  className="bg-primaryColor hover:bg-primaryColor/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All FAQs</h2>
          </div>

          {faqs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No FAQs found. Create your first FAQ!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Question</TableHead>
                    <TableHead className="font-semibold">Answer</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq._id} className="hover:bg-gray-50">
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{faq.question}</div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-3">{faq.answer}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(faq)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTrash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  FAQ.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border border-gray-300">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => faq._id && handleDelete(faq._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={openEditDialog !== null}
          onOpenChange={(open) => {
            if (!open) {
              setOpenEditDialog(null);
              resetForm();
              setIsSubmitting(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit FAQ</DialogTitle>
              <DialogDescription>
                Update the FAQ question and answer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-question" className="text-right font-medium pt-2">
                  Question
                </Label>
                <Textarea
                  id="edit-question"
                  placeholder="Enter the question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-answer" className="text-right font-medium pt-2">
                  Answer
                </Label>
                <Textarea
                  id="edit-answer"
                  placeholder="Enter the answer"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="col-span-3 min-h-[150px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEditDialog(null);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => openEditDialog && handleEdit(openEditDialog)}
                className="bg-primaryColor hover:bg-primaryColor/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

