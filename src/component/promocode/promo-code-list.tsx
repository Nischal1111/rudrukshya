"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card"
import PromoCodeItem from "./promo-code-item"
import { listPromocodes } from "@/services/promocode"

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
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  useEffect(() => {
    fetchPromocodes()
  }, [refresh])

  const fetchPromocodes = async () => {
    setLoading(true)
    try {
      const data = await listPromocodes(token)
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
