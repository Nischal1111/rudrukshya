"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/card"
import { getDashboardStats } from "@/services/dashboard"

interface Stats {
  users: number
  products: number
  orders: number
  events: number
  blogs: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats(token)
        setStats(data.totals)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center">Failed to load statistics</div>
  }

  const statCards = [
    { label: "Total Users", value: stats.users },
    { label: "Total Products", value: stats.products },
    { label: "Total Orders", value: stats.orders },
    { label: "Total Events", value: stats.events },
    { label: "Total Blogs", value: stats.blogs },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
