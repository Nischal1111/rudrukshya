"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import OrderTableRow from "./order-table-row"
import OrderPagination from "./order-pagination"
import OrderViewModal from "./order-view-modal"
import OrderEditModal from "./order-edit-modal"
import OrderDeleteDialog from "./order-delete-dialog"
import { toast } from "sonner"

interface OrdersTableProps {
  filters: {
    orderStatus: string
    paymentStatus: string
    searchQuery: string
  }
  page: number
  onPageChange: (page: number) => void
}

const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error("Failed to fetch orders")
  return res.json()
}

export default function OrdersTable({ filters, page, onPageChange }: OrdersTableProps) {
  const queryParams = new URLSearchParams()
  if (filters.orderStatus) queryParams.append("orderStatus", filters.orderStatus)
  if (filters.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus)
  if (filters.searchQuery) queryParams.append("searchQuery", filters.searchQuery)
  queryParams.append("page", String(page))
  queryParams.append("limit", "10")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.endsWith("/")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : `${process.env.NEXT_PUBLIC_BASE_URL}/`

  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  const { data, isLoading, error, mutate } = useSWR(
    [`${baseUrl}order/all?${queryParams.toString()}`, token],
    fetcher,
    { revalidateOnFocus: false }
  )

  const orders = data?.data || []
  const pagination = data?.pagination || { totalPages: 1, currentPage: 1 }

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load orders</p>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Photo</TableHead>
              <TableHead>Created At</TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <OrderTableRow
                key={order._id}
                order={order}
                onDataChange={() => mutate()}
                onView={() => {
                  setSelectedOrder(order)
                  setViewOpen(true)
                }}
                onEdit={() => {
                  setSelectedOrder(order)
                  setEditOpen(true)
                }}
                onDelete={() => {
                  setSelectedOrder(order)
                  setDeleteOpen(true)
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <OrderPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />

      {/* Modals outside table */}
      {selectedOrder && (
        <>
          <OrderViewModal
            open={viewOpen}
            onOpenChange={setViewOpen}
            order={selectedOrder}
          />
          <OrderEditModal
            open={editOpen}
            onOpenChange={setEditOpen}
            order={selectedOrder}
            onSuccess={() => {
              toast.success("Order updated successfully")
              mutate()
            }}
          />
          <OrderDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            orderId={selectedOrder._id}
            onSuccess={() => {
              toast.success("Order deleted successfully")
              mutate()
            }}
          />
        </>
      )}
    </div>
  )
}
