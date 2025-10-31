"use client"

import { useState } from "react"
import OrdersTable from "@/component/orders/orders-table"
import OrdersFilters from "@/component/orders/orders-filter"
import { Card } from "@/component/ui/card"

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    searchQuery: "",
  })
  const [page, setPage] = useState(1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="max-w-7xl">
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="mt-2 text-muted-foreground">View, filter, and manage all customer orders</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <OrdersFilters filters={filters} onFilterChange={setFilters} onPageReset={() => setPage(1)} />

        {/* Orders Table */}
        <div className="mt-8">
          <Card>
            <OrdersTable filters={filters} page={page} onPageChange={setPage} />
          </Card>
        </div>
      </main>
    </div>
  )
}
