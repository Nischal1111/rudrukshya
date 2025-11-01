"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PromoCodeList from "@/component/promocode/promo-code-list"

export default function Home() {
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    discountAmount: "",
    isActive: false,
    usageLimit: "",
  })
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCreatePromocode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/promocode/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          discountPercentage: formData.discountPercentage ? Number.parseInt(formData.discountPercentage) : undefined,
          discountAmount: formData.discountAmount ? Number.parseInt(formData.discountAmount) : undefined,
          isActive: formData.isActive,
          usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Failed to create promocode")
        return
      }

      toast.success("Promocode created successfully!")
      setFormData({ code: "", discountPercentage: "", discountAmount: "", isActive: false, usageLimit: "" })
      setRefresh((prev) => prev + 1)
    } catch (error) {
      toast.error("An error occurred while creating the promocode")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Promocode Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Promocode Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Promocode</CardTitle>
              <CardDescription>Add a new promocode to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromocode} className="space-y-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountPercentage">Discount %</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountAmount">Discount Amount</Label>
                    <Input
                      id="discountAmount"
                      name="discountAmount"
                      type="number"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Promocode"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Promocodes List */}
          <PromoCodeList refresh={refresh} onRefresh={() => setRefresh((prev) => prev + 1)} />
        </div>
      </div>
    </main>
  )
}
