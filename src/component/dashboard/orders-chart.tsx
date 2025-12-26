"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/card"
import { getDashboardStats } from "@/services/dashboard"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface OrderData {
  date: string
  orders: number
  revenue: number
}

export function OrdersChart() {
  const [data, setData] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDashboardStats(token)
        setData(result.charts.ordersOverTime)
      } catch (error) {
        console.error("Failed to fetch orders data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Over Time (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(var(--chart-1))" name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
