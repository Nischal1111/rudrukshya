"use client"

import { useState, useEffect } from "react"
import { X, Star, Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
} from "@/services/product-review"

interface Product {
  _id: string
  title: string
  img?: string[]
}

interface Review {
  _id: string
  userID: {
    _id: string
    fullName: string
    email?: string
  }
  reviewerName?: string
  rating: number
  commentTitle: string
  comment: string
  createdAt: string
  updatedAt?: string
}

interface ProductReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  token: string
  onSuccess?: () => void
}

export default function ProductReviewModal({
  open,
  onOpenChange,
  product,
  token,
  onSuccess,
}: ProductReviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  // Form state
  const [rating, setRating] = useState(5)
  const [reviewerName, setReviewerName] = useState("")
  const [commentTitle, setCommentTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch reviews
  const fetchReviews = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const data = await getProductReviews(product._id, pageNum, 10)
      setReviews(data.reviews || [])
      setPage(data.currentPage || 1)
      setTotalPages(data.totalPages || 1)
      setTotalReviews(data.totalReviews || 0)
      setAverageRating(data.stats?.averageRating || 0)
      setLoading(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch reviews")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && product._id) {
      fetchReviews(1)
      setShowAddForm(false)
      setEditingReview(null)
      resetForm()
    }
  }, [open, product._id])

  const resetForm = () => {
    setRating(5)
    setReviewerName("")
    setCommentTitle("")
    setComment("")
  }

  const handleAddReview = async () => {
    if (!reviewerName.trim() || !commentTitle.trim() || !comment.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    if (!token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)
      await createProductReview(
        product._id,
        { 
          rating, 
          reviewerName: reviewerName.trim(),
          commentTitle: commentTitle.trim(), 
          comment: comment.trim() 
        },
        token
      )
      toast.success("Review added successfully")
      resetForm()
      setShowAddForm(false)
      fetchReviews(page)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to add review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setRating(review.rating)
    setReviewerName(review.reviewerName || review.userID?.fullName || "")
    setCommentTitle(review.commentTitle)
    setComment(review.comment)
    setShowAddForm(true)
  }

  const handleUpdateReview = async () => {
    if (!editingReview) return
    if (!reviewerName.trim() || !commentTitle.trim() || !comment.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    if (!token) {
      toast.error("Authentication required")
      return
    }

    try {
      setSubmitting(true)
      await updateProductReview(
        product._id,
        editingReview._id,
        { 
          rating, 
          reviewerName: reviewerName.trim(),
          commentTitle: commentTitle.trim(), 
          comment: comment.trim() 
        },
        token
      )
      toast.success("Review updated successfully")
      resetForm()
      setShowAddForm(false)
      setEditingReview(null)
      fetchReviews(page)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to update review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete || !token) return

    try {
      setSubmitting(true)
      await deleteProductReview(product._id, reviewToDelete, token)
      toast.success("Review deleted successfully")
      setDeleteDialogOpen(false)
      setReviewToDelete(null)
      fetchReviews(page)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowAddForm(false)
    setEditingReview(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Reviews for {product.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {editingReview ? "Edit Review" : "Add New Review"}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reviewerName">Reviewer Name</Label>
                  <Input
                    id="reviewerName"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter reviewer name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="commentTitle">Review Title</Label>
                  <Input
                    id="commentTitle"
                    value={commentTitle}
                    onChange={(e) => setCommentTitle(e.target.value)}
                    placeholder="Enter review title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Review Comment</Label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your review"
                    className="mt-1 w-full min-h-[100px] p-2 border rounded-md resize-y"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingReview ? handleUpdateReview : handleAddReview}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {editingReview ? "Update Review" : "Add Review"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Add Review Button */}
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Review
              </Button>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {review.reviewerName || review.userID?.fullName || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">
                          {review.commentTitle}
                        </h4>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(review._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to add a review!
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

