"use client"

import { X, ZoomIn } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { useState } from "react"

interface OrderViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
}

export default function OrderViewModal({ open, onOpenChange, order }: OrderViewModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  if (!order) return null

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl)
    setLightboxOpen(true)
  }

  // Determine location type
  const locationType = order?.orderLocationType ||
    (order?.shippingLocation === 'insideKathmandu' || order?.shippingLocation === 'outsideKathmandu' ||
      order?.deliveryAddress?.country?.toLowerCase() === 'nepal') ? 'nepal' :
    (order?.shippingLocation === 'india' || order?.deliveryAddress?.country?.toLowerCase() === 'india') ? 'india' :
      'other'

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
                  <p className="text-muted-foreground">Order Type</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                    (order?.orderType || (order?.userId ? 'user' : 'guest')) === 'user' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(order?.orderType || (order?.userId ? 'user' : 'guest')) === 'user' ? 'User' : 'Guest'}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{order.deliveryAddress?.fullname || order.fullname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{order.deliveryAddress?.email || order.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.deliveryAddress?.phone || order.phone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address - Location Specific */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Delivery Address</h3>
              <div className="space-y-2 text-sm">
                {/* Nepal Address Format */}
                {locationType === 'nepal' && (
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Country:</span> <span className="font-medium">{order.deliveryAddress?.country || "-"}</span></p>
                    {order.deliveryAddress?.province && (
                      <p><span className="text-muted-foreground">Province:</span> <span className="font-medium">{order.deliveryAddress.province}</span></p>
                    )}
                    {order.deliveryAddress?.district && (
                      <p><span className="text-muted-foreground">District:</span> <span className="font-medium">{order.deliveryAddress.district}</span></p>
                    )}
                    {order.deliveryAddress?.municipality && (
                      <p><span className="text-muted-foreground">Municipality / Rural Municipality:</span> <span className="font-medium">{order.deliveryAddress.municipality}</span></p>
                    )}
                    {order.deliveryAddress?.wardNumber && (
                      <p><span className="text-muted-foreground">Ward Number:</span> <span className="font-medium">{order.deliveryAddress.wardNumber}</span></p>
                    )}
                    {order.deliveryAddress?.streetToleLandmark && (
                      <p><span className="text-muted-foreground">Street / Tole / Landmark:</span> <span className="font-medium">{order.deliveryAddress.streetToleLandmark}</span></p>
                    )}
                  </div>
                )}

                {/* India Address Format */}
                {locationType === 'india' && (
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Country:</span> <span className="font-medium">{order.deliveryAddress?.country || "-"}</span></p>
                    {order.deliveryAddress?.state && (
                      <p><span className="text-muted-foreground">State:</span> <span className="font-medium">{order.deliveryAddress.state}</span></p>
                    )}
                    {order.deliveryAddress?.addressLine1 && (
                      <p><span className="text-muted-foreground">Address Line 1:</span> <span className="font-medium">{order.deliveryAddress.addressLine1}</span></p>
                    )}
                    {order.deliveryAddress?.addressLine2 && (
                      <p><span className="text-muted-foreground">Address Line 2:</span> <span className="font-medium">{order.deliveryAddress.addressLine2}</span></p>
                    )}
                    {order.deliveryAddress?.landmark && (
                      <p><span className="text-muted-foreground">Landmark:</span> <span className="font-medium">{order.deliveryAddress.landmark}</span></p>
                    )}
                  </div>
                )}

                {/* Other Countries Address Format */}
                {locationType === 'other' && (
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Country:</span> <span className="font-medium">{order.deliveryAddress?.country || "-"}</span></p>
                    {order.deliveryAddress?.addressLine1Other && (
                      <p><span className="text-muted-foreground">Address Line 1:</span> <span className="font-medium">{order.deliveryAddress.addressLine1Other}</span></p>
                    )}
                    {order.deliveryAddress?.addressLine2Other && (
                      <p><span className="text-muted-foreground">Address Line 2:</span> <span className="font-medium">{order.deliveryAddress.addressLine2Other}</span></p>
                    )}
                    {order.deliveryAddress?.stateProvinceRegion && (
                      <p><span className="text-muted-foreground">State / Province / Region:</span> <span className="font-medium">{order.deliveryAddress.stateProvinceRegion}</span></p>
                    )}
                    {order.deliveryAddress?.postalZipCode && (
                      <p><span className="text-muted-foreground">Postal / ZIP Code:</span> <span className="font-medium">{order.deliveryAddress.postalZipCode}</span></p>
                    )}
                  </div>
                )}

                {/* Fallback for legacy addresses */}
                {!order.deliveryAddress?.fullname && !order.deliveryAddress?.addressLine1 && !order.deliveryAddress?.addressLine1Other && (
                  <div className="space-y-2">
                    {order.deliveryAddress?.street && (
                      <p><span className="text-muted-foreground">Street:</span> <span className="font-medium">{order.deliveryAddress.street}</span></p>
                    )}
                    {order.deliveryAddress?.city && (
                      <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{order.deliveryAddress.city}</span></p>
                    )}
                    {order.deliveryAddress?.postalCode && (
                      <p><span className="text-muted-foreground">Postal Code:</span> <span className="font-medium">{order.deliveryAddress.postalCode}</span></p>
                    )}
                    <p><span className="text-muted-foreground">Country:</span> <span className="font-medium">{order.deliveryAddress?.country || "-"}</span></p>
                  </div>
                )}

                {order.deliveryAddress?.additionalNotes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p><span className="text-muted-foreground">Address Notes:</span> <span className="font-medium">{order.deliveryAddress.additionalNotes}</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Location-Specific Information */}
            {locationType === 'nepal' && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Nepal Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Shipping Location</p>
                    <p className="font-medium">
                      {order.shippingLocation === 'insideKathmandu' ? 'Inside Kathmandu Valley' :
                        order.shippingLocation === 'outsideKathmandu' ? 'Overall Nepal (Outside KTM)' :
                          'Nepal'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Fee</p>
                    <p className="font-medium">
                      {locationType === 'nepal' ? 'Rs.' : locationType === 'india' ? '₹' : '$'}
                      {order.shippingFee != null ? (order.shippingFee / 100).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Province</p>
                    <p className="font-medium">{order.deliveryAddress?.province || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{order.deliveryAddress?.district || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Municipality</p>
                    <p className="font-medium">{order.deliveryAddress?.municipality || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ward Number</p>
                    <p className="font-medium">{order.deliveryAddress?.wardNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Type</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800`}>
                      Nepal
                    </span>
                  </div>
                </div>
              </div>
            )}

            {locationType === 'india' && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">India Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Shipping Location</p>
                    <p className="font-medium">India</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Fee</p>
                    <p className="font-medium">
                      {locationType === 'india' ? '₹' : locationType === 'nepal' ? 'Rs.' : '$'}
                      {order.shippingFee != null ? (order.shippingFee / 100).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium">{order.deliveryAddress?.state || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address Line 1</p>
                    <p className="font-medium">{order.deliveryAddress?.addressLine1 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address Line 2</p>
                    <p className="font-medium">{order.deliveryAddress?.addressLine2 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Landmark</p>
                    <p className="font-medium">{order.deliveryAddress?.landmark || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Type</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800`}>
                      India
                    </span>
                  </div>
                </div>
              </div>
            )}

            {locationType === 'other' && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">International Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{order.deliveryAddress?.country || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Fee</p>
                    <p className="font-medium">
                      {locationType === 'other' ? '$' : locationType === 'nepal' ? 'Rs.' : '₹'}
                      {order.shippingFee != null ? (order.shippingFee / 100).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address Line 1</p>
                    <p className="font-medium">{order.deliveryAddress?.addressLine1Other || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address Line 2</p>
                    <p className="font-medium">{order.deliveryAddress?.addressLine2Other || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State/Province/Region</p>
                    <p className="font-medium">{order.deliveryAddress?.stateProvinceRegion || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Postal/ZIP Code</p>
                    <p className="font-medium">{order.deliveryAddress?.postalZipCode || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Type</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                      International
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Information - Common for all locations */}
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
                {locationType !== 'nepal' && locationType !== 'india' && (
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod || "-"}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {order.orderLocationType === 'nepal' ? 'Rs.' : order.orderLocationType === 'india' ? '₹' : '$'}
                    {order.subtotal != null ? (order.subtotal / 100).toFixed(2) :
                      order.subtotalAfterDiscount != null ? (order.subtotalAfterDiscount / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
                {order.discountAmount > 0 && (
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-medium text-green-600">
                      -{order.orderLocationType === 'nepal' ? 'Rs.' : order.orderLocationType === 'india' ? '₹' : '$'}
                      {order.discountAmount != null ? (order.discountAmount / 100).toFixed(2) : "0.00"}
                    </p>
                  </div>
                )}
                {order.subtotalAfterDiscount != null && (
                  <div>
                    <p className="text-muted-foreground">Subtotal After Discount</p>
                    <p className="font-medium">
                      {order.orderLocationType === 'nepal' ? 'Rs.' : order.orderLocationType === 'india' ? '₹' : '$'}
                      {(order.subtotalAfterDiscount / 100).toFixed(2)}
                    </p>
                  </div>
                )}
                {order.shippingFee > 0 && (
                  <div>
                    <p className="text-muted-foreground">Shipping Fee</p>
                    <p className="font-medium">
                      {order.orderLocationType === 'nepal' ? 'Rs.' : order.orderLocationType === 'india' ? '₹' : '$'}
                      {(order.shippingFee / 100).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg text-primary">
                    {order.orderLocationType === 'nepal' ? 'Rs.' : order.orderLocationType === 'india' ? '₹' : '$'}
                    {order.totalAmout != null ? (order.totalAmout / 100).toFixed(2) : "0.00"}
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

            {/* Payment Verification Image - Show for Nepal and India */}
            {order.paymentVerificationImage && (locationType === 'nepal' || locationType === 'india') && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  {locationType === 'nepal' ? 'Nepal Payment Verification' : 'India Payment Verification'}
                </h3>
                <div className="relative group">
                  <div
                    className="relative w-full max-w-md h-64 border-2 border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleImageClick(order.paymentVerificationImage)}
                  >
                    <Image
                      src={order.paymentVerificationImage}
                      alt="Payment verification"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Click image to view in full size</p>
                </div>
              </div>
            )}

            {/* International Payment Info - Show for Other countries */}
            {locationType === 'other' && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">International Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-medium">{order.transactionId || "-"}</p>
                  </div>
                  {order.paymentVerificationImage && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-2">Payment Proof</p>
                      <div className="relative group">
                        <div
                          className="relative w-full max-w-md h-64 border-2 border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handleImageClick(order.paymentVerificationImage)}
                        >
                          <Image
                            src={order.paymentVerificationImage}
                            alt="Payment verification"
                            fill
                            className="object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Click image to view in full size</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          {locationType === 'nepal' ? 'Rs.' : locationType === 'india' ? '₹' : '$'}
                          {product.price ? (parseFloat(product.price) / 100).toFixed(2) : "0.00"}
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

      {/* Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => {
            setLightboxOpen(false)
            setLightboxImage(null)
          }}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => {
                setLightboxOpen(false)
                setLightboxImage(null)
              }}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
              <Image
                src={lightboxImage}
                alt="Payment verification - Full size"
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
