"use client"

import { useState } from "react"
import { Search, ChevronDown } from "lucide-react"

interface OrdersFiltersProps {
  filters: {
    orderStatus: string
    paymentStatus: string
    searchQuery: string
  }
  onFilterChange: (filters: any) => void
  onPageReset: () => void
}

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"]
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed"]

export default function OrdersFilters({ filters, onFilterChange, onPageReset }: OrdersFiltersProps) {
  const [orderStatusOpen, setOrderStatusOpen] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onPageReset()
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search Input */}
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Email or Order ID"
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            />
          </div>
        </div>

        {/* Order Status Dropdown */}
        <div className="md:col-span-1 relative">
          <button
            onClick={() => setOrderStatusOpen(!orderStatusOpen)}
            className="w-full px-3 py-2 text-left border border-input bg-background rounded-md flex items-center justify-between hover:bg-accent/50 transition text-foreground"
          >
            <span className={filters.orderStatus ? "text-foreground" : "text-muted-foreground"}>
              {filters.orderStatus
                ? ORDER_STATUSES.find((s) => s.toLowerCase() === filters.orderStatus)
                : "Order Status"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {orderStatusOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10">
              <button
                onClick={() => {
                  handleFilterChange("orderStatus", "")
                  setOrderStatusOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-accent/50 transition text-foreground text-sm"
              >
                All Statuses
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleFilterChange("orderStatus", status.toLowerCase())
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

        {/* Payment Status Dropdown */}
        <div className="md:col-span-1 relative">
          <button
            onClick={() => setPaymentStatusOpen(!paymentStatusOpen)}
            className="w-full px-3 py-2 text-left border border-input bg-background rounded-md flex items-center justify-between hover:bg-accent/50 transition text-foreground"
          >
            <span className={filters.paymentStatus ? "text-foreground" : "text-muted-foreground"}>
              {filters.paymentStatus
                ? PAYMENT_STATUSES.find((s) => s.toLowerCase() === filters.paymentStatus)
                : "Payment Status"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {paymentStatusOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10">
              <button
                onClick={() => {
                  handleFilterChange("paymentStatus", "")
                  setPaymentStatusOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-accent/50 transition text-foreground text-sm"
              >
                All Payment Statuses
              </button>
              {PAYMENT_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleFilterChange("paymentStatus", status.toLowerCase())
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

        {/* Reset Button */}
        <div className="md:col-span-1">
          <button
            onClick={() => {
              onPageReset()
              onFilterChange({
                orderStatus: "",
                paymentStatus: "",
                searchQuery: "",
              })
            }}
            className="w-full px-4 py-2 border border-input rounded-md hover:bg-accent/50 transition text-foreground text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}
