"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/component/ui/badge"
import { format } from "date-fns"
import Image from "next/image"

interface OrderTableRowProps {
  order: any
  onDataChange: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
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

export default function OrderTableRow({ order, onView, onEdit, onDelete }: OrderTableRowProps) {
  const orderStatusBadge = getStatusBadge(order?.orderStatus)
  const paymentStatusBadge = getStatusBadge(order?.paymentStatus)

  // Determine order type: user or guest
  const orderType = order?.orderType || (order?.userId ? 'user' : 'guest');

  // Determine location type
  const locationType = order?.orderLocationType || 
    (order?.shippingLocation === 'insideKathmandu' || order?.shippingLocation === 'outsideKathmandu' || 
     order?.deliveryAddress?.country?.toLowerCase() === 'nepal') ? 'nepal' :
    (order?.shippingLocation === 'india' || order?.deliveryAddress?.country?.toLowerCase() === 'india') ? 'india' :
    'other';

  return (
    <TableRow>
      <TableCell className="font-medium">{order?.orderId}</TableCell>
      <TableCell>
        <Badge className={orderType === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
          {orderType === 'user' ? 'User' : 'Guest'}
        </Badge>
      </TableCell>
      <TableCell>{order?.fullname}</TableCell>
      <TableCell>{order?.email}</TableCell>
      <TableCell>{order?.phone}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {locationType === 'nepal' ? 'Rs.' : locationType === 'india' ? '₹' : '$'}
            {order?.totalAmout != null ? (order.totalAmout / 100).toFixed(2) : "0.00"}
          </span>
          {order?.shippingFee > 0 && (
            <span className="text-xs text-muted-foreground">
              Shipping: {locationType === 'nepal' ? 'Rs.' : locationType === 'india' ? '₹' : '$'}
              {(order.shippingFee / 100).toFixed(2)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${orderStatusBadge.bg} ${orderStatusBadge.text}`}>
          {order?.orderStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={`${paymentStatusBadge.bg} ${paymentStatusBadge.text}`}>
          {order?.paymentStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {order?.paymentMethod || "-"}
        </div>
      </TableCell>
      <TableCell>
        {order?.paymentVerificationImage ? (
          <Image src={order?.paymentVerificationImage} alt="Payment verification" width={20} height={20} className="rounded" />
        ) : "-"}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">{format(new Date(order?.createdAt), "MMM dd, yyyy")}</span>
          <Badge className={
            locationType === 'nepal' ? 'bg-green-100 text-green-800' :
            locationType === 'india' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }>
            {locationType === 'nepal' ? 'Nepal' :
             locationType === 'india' ? 'India' :
             'Other'}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onView} title="View order">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} title="Edit order">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete order">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
