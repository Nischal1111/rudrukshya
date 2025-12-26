"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { X, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateOrderStatus, updatePaymentStatus } from "@/services/order"

interface OrderEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onSuccess: () => void
}

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"]
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed"]

export default function OrderEditModal({ open, onOpenChange, order, onSuccess }: OrderEditModalProps) {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || "")
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "")
  const [orderStatusOpen, setOrderStatusOpen] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync state when a new order is loaded
  useEffect(() => {
    setOrderStatus(order?.orderStatus || "")
    setPaymentStatus(order?.paymentStatus || "")
  }, [order])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOrderStatusOpen(false)
        setPaymentStatusOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const updates: any = {}
      if (orderStatus !== order.orderStatus) updates.orderStatus = orderStatus
      if (paymentStatus !== order.paymentStatus) updates.paymentStatus = paymentStatus

      if (Object.keys(updates).length === 0) {
        toast.success("No changes made")
        return
      }

      if (updates.orderStatus) {
        await updateOrderStatus(order._id, updates.orderStatus, token)
      }

      if (updates.paymentStatus) {
        await updatePaymentStatus(order._id, updates.paymentStatus, token)
      }

      toast.success("Order updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update order")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      Processing: { bg: "bg-blue-100", text: "text-blue-800" },
      Completed: { bg: "bg-green-100", text: "text-green-800" },
      Cancelled: { bg: "bg-red-100", text: "text-red-800" },
    }
    const paymentMap: Record<string, { bg: string; text: string }> = {
      Pending: { bg: "bg-orange-100", text: "text-orange-800" },
      Paid: { bg: "bg-green-100", text: "text-green-800" },
      Failed: { bg: "bg-red-100", text: "text-red-800" },
    }
    return statusMap[status] || paymentMap[status] || { bg: "bg-gray-100", text: "text-gray-800" }
  }

  const orderStatusBadge = getStatusBadge(orderStatus)
  const paymentStatusBadge = getStatusBadge(paymentStatus)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div
        ref={dropdownRef}
        className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Edit Order - {order?._id}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Order Status Dropdown */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Order Status
            </label>
            <div className="relative">
              <button
                onClick={() => setOrderStatusOpen(!orderStatusOpen)}
                className="w-full px-3 py-2 text-left border border-input bg-background rounded-md flex items-center justify-between hover:bg-accent/50 transition"
              >
                <span className={orderStatus ? "text-foreground" : "text-muted-foreground"}>
                  {orderStatus || "Select status"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {orderStatusOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setOrderStatus(status)
                        setOrderStatusOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent/50 transition text-foreground text-sm"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Payment Status
            </label>
            <div className="relative">
              <button
                onClick={() => setPaymentStatusOpen(!paymentStatusOpen)}
                className="w-full px-3 py-2 text-left border border-input bg-background rounded-md flex items-center justify-between hover:bg-accent/50 transition"
              >
                <span className={paymentStatus ? "text-foreground" : "text-muted-foreground"}>
                  {paymentStatus || "Select status"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {paymentStatusOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10">
                  {PAYMENT_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setPaymentStatus(status)
                        setPaymentStatusOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent/50 transition text-foreground text-sm"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-input rounded-md hover:bg-accent/50 transition text-foreground text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  )
}
