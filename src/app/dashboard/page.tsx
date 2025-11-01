import { DashboardStats } from "@/component/dashboard/dashboard-stats"
import { OrdersChart } from "@/component/dashboard/orders-chart"
import { TopProductsChart } from "@/component/dashboard/top-products-chart"
import { ProductCategoriesChart } from "@/component/dashboard/product-categories-chart"
import { UserSignupsChart } from "@/component/dashboard/user-signups-chart"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <OrdersChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <TopProductsChart />
        <ProductCategoriesChart />
      </div>
    </div>
  )
}
