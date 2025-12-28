"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/component/ui/card"
import { Input } from "@/components/ui/input"
import { updatePromocode, deletePromocode } from "@/services/promocode"

interface PromoCodeItemProps {
  promo: any
  onDelete: () => void
  onUpdate: () => void
}

export default function PromoCodeItem({ promo, onDelete, onUpdate }: PromoCodeItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    code: promo.code,
    discountPercentage: promo.discountPercentage || "",
    discountAmount: promo.discountAmount || "",
    isActive: promo.isActive,
    usageLimit: promo.usageLimit || "",
  })
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  const handleUpdate = async () => {
    try {
      await updatePromocode(promo._id, {
        code: formData.code,
        discountPercentage: formData.discountPercentage
          ? Number.parseInt(formData.discountPercentage.toString())
          : undefined,
        discountAmount: formData.discountAmount ? Number.parseInt(formData.discountAmount.toString()) : undefined,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit.toString()) : null,
      }, token)

      toast.success("Promocode updated successfully!")
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast.error("An error occurred while updating the promocode")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePromocode(promo._id, token)

      toast.success("Promocode deleted successfully!")
      onDelete()
    } catch (error) {
      toast.error("An error occurred while deleting the promocode")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Code"
          />
          <Input
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
            placeholder="Discount %"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={formData.discountAmount}
            onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
            placeholder="Discount Amount"
          />
          <Input
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            placeholder="Usage Limit"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="isActive" className="text-sm font-medium cursor-pointer flex-1">
            {formData.isActive ? "✓ Active" : "✗ Inactive"}
          </label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} size="sm" variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold">{promo.code}</p>
          <p className="text-sm text-muted-foreground">
            {promo.discountPercentage ? `${promo.discountPercentage}% off` : `$${promo.discountAmount} off`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {promo.isActive ? "✓ Active" : "✗ Inactive"} {promo.usageLimit ? `• Limit: ${promo.usageLimit}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
            Edit
          </Button>
          <Button onClick={handleDelete} size="sm" variant="destructive" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
