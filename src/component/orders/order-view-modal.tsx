"use client"

import { X } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface OrderViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
}

export default function OrderViewModal({ open, onOpenChange, order }: OrderViewModalProps) {
  if (!order) return null

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => onOpenChange(false)} />}

      {/* Modal */}
      {open && (
        <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Order Details - {order._id}</h2>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{order.fullname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{order.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.country} - {order.deliveryAddress?.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Order Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Status</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                    {order.orderStatus}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg text-primary">
                    ${order.totalAmout?.toFixed(2) || "0.00"}
                  </p>
                </div>
                {order.promocode && (
                  <div>
                    <p className="text-muted-foreground">Promo Code</p>
                    <p className="font-medium">{order.promocode.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            {order.products && order.products.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Products</h3>
                <div className="space-y-4">
                  {order.products.map((item: any) => {
                    const product = item.productId
                    const variant = item.variant?.name || "Default"
                    const sizeName = product.size?.find((s: any) => s._id === item.size)?.name || item.size

                    return (
                      <div key={item._id} className="flex gap-4 border-b border-border pb-4">
                        <div className="w-20 h-20 relative flex-shrink-0">
                          {product.img && product.img[0] && (
                            <Image
                              src={product.img[0]}
                              alt={product.title}
                              fill
                              className="object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{product.title}</p>
                          <p className="text-sm text-muted-foreground">Variant: {variant}</p>
                          <p className="text-sm text-muted-foreground">Size: {sizeName}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex-shrink-0 font-medium text-foreground">
                          ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-medium">{format(new Date(order.createdAt), "PPp")}</p>
                </div>
                {order.updatedAt && (
                  <div>
                    <p className="text-muted-foreground">Updated At</p>
                    <p className="font-medium">{format(new Date(order.updatedAt), "PPp")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
