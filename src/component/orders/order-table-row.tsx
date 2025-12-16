"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/component/ui/badge"
import { format } from "date-fns"

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

  return (
    <TableRow>
      <TableCell className="font-medium">{order?.orderId}</TableCell>
      <TableCell>{order?.fullname}</TableCell>
      <TableCell>{order?.email}</TableCell>
      <TableCell>{order?.phone}</TableCell>
      <TableCell>${order?.totalAmout != null ? (order.totalAmout / 100).toFixed(2) : "0.00"}</TableCell>
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
          {order?.paymentVerificationImage && (
            <span title="Payment verification image available" className="inline-flex">
              <ImageIcon className="h-4 w-4 text-green-600" aria-hidden="true" />
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{format(new Date(order?.createdAt), "MMM dd, yyyy")}</TableCell>
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
