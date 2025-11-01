"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card"
import PromoCodeItem from "./promo-code-item"

interface PromoCode {
  _id: string
  code?: string
  discountPercentage?: number
  discountAmount?: number
  isActive: boolean
  usageLimit?: number | null
}

interface PromoCodeListProps {
  refresh: number
  onRefresh: () => void
}

export default function PromoCodeList({ refresh, onRefresh }: PromoCodeListProps) {
  const [promocodes, setPromocodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromocodes()
  }, [refresh])

  const fetchPromocodes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/promocode/list`)
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Failed to fetch promocodes")
        return
      }
      console.log(data.promos)
      setPromocodes(data.promos || [])
    } catch (error) {
      toast.error("An error occurred while fetching promocodes")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Promocodes</CardTitle>
        <CardDescription>View and manage existing promocodes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading promocodes...</p>
        ) : promocodes.length === 0 ? (
          <p className="text-muted-foreground">No promocodes found</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {promocodes.map((promo) => (
              <PromoCodeItem key={promo._id} promo={promo} onDelete={onRefresh} onUpdate={onRefresh} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
