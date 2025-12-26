"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteOrder } from "@/services/order"

interface OrderDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  onSuccess: () => void
}

export default function OrderDeleteDialog({ open, onOpenChange, orderId, onSuccess }: OrderDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await deleteOrder(orderId, token)
      toast.success("Order deleted successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to delete order")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => onOpenChange(false)} />}

      {/* Dialog */}
      {open && (
        <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Delete Order</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-foreground">
              Are you sure you want to delete order <span className="font-semibold">{orderId}</span>? This action cannot
              be undone.
            </p>
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
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
