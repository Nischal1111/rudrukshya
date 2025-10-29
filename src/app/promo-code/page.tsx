"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus, X, ChevronDown } from "lucide-react"

interface Product {
  _id: string
  title: string
  price: number
}

interface Promocode {
  _id: string
  code: string
  discountPercentage: number
  isActive: boolean
  usageLimit: number | null
  usedCount: number
  applicableProducts: string[]
  createdAt: string
}

export default function PromocodesPage() {
  const [promocodes, setPromocodes] = useState<Promocode[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    usageLimit: "",
    isActive: true,
    applicableProducts: [] as string[],
  })

  useEffect(() => {
    fetchPromocodes()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchPromocodes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/promocodes")
      const data = await response.json()
      setPromocodes(data)
    } catch (error) {
      setToast({ message: "Failed to fetch promocodes", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.discountPercentage) {
      setToast({ message: "Please fill in all required fields", type: "error" })
      return
    }

    try {
      const payload = {
        code: formData.code,
        discountPercentage: Number.parseInt(formData.discountPercentage),
        isActive: formData.isActive,
        usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit) : null,
        applicableProducts: formData.applicableProducts,
      }

      if (editingId) {
        const response = await fetch(`/api/promocodes?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("Failed to update")
        setToast({ message: "Promocode updated successfully", type: "success" })
      } else {
        const response = await fetch("/api/promocodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("Failed to create")
        setToast({ message: "Promocode created successfully", type: "success" })
      }

      setIsOpen(false)
      setEditingId(null)
      setFormData({
        code: "",
        discountPercentage: "",
        usageLimit: "",
        isActive: true,
        applicableProducts: [],
      })
      fetchPromocodes()
    } catch (error) {
      setToast({
        message: editingId ? "Failed to update promocode" : "Failed to create promocode",
        type: "error",
      })
    }
  }

  const handleEdit = (promo: Promocode) => {
    setEditingId(promo._id)
    setFormData({
      code: promo.code,
      discountPercentage: promo.discountPercentage.toString(),
      usageLimit: promo.usageLimit?.toString() || "",
      isActive: promo.isActive,
      applicableProducts: promo.applicableProducts,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/promocodes?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")
      setToast({ message: "Promocode deleted successfully", type: "success" })
      setShowDeleteConfirm(null)
      fetchPromocodes()
    } catch (error) {
      setToast({ message: "Failed to delete promocode", type: "error" })
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        code: "",
        discountPercentage: "",
        usageLimit: "",
        isActive: true,
        applicableProducts: [],
      })
      setShowProductDropdown(false)
    }
  }

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter((id) => id !== productId)
        : [...prev.applicableProducts, productId],
    }))
  }

  const getApplicableProductsText = () => {
    if (formData.applicableProducts.length === 0) {
      return "All Products"
    }
    if (formData.applicableProducts.length === 1) {
      const product = products.find((p) => p._id === formData.applicableProducts[0])
      return product?.title || "1 Product"
    }
    return `${formData.applicableProducts.length} Products`
  }

  const getPromoProductsText = (promo: Promocode) => {
    if (promo.applicableProducts.length === 0) {
      return "All Products"
    }
    if (promo.applicableProducts.length === 1) {
      const product = products.find((p) => p._id === promo.applicableProducts[0])
      return product?.title || "1 Product"
    }
    return `${promo.applicableProducts.length} Products`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Promocodes</h1>
            <p className="text-gray-600 mt-2">Manage your promotional codes and discounts</p>
          </div>

          <button
            onClick={() => handleOpenChange(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Promocode
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-current opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Dialog */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Promocode" : "Create Promocode"}</h2>
                <button onClick={() => handleOpenChange(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%) *</label>
                  <input
                    type="number"
                    placeholder="20"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Applicable Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Products</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProductDropdown(!showProductDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between bg-white hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{getApplicableProductsText()}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${showProductDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showProductDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {products.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">No products available</div>
                        ) : (
                          products.map((product) => (
                            <label
                              key={product._id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={formData.applicableProducts.includes(product._id)}
                                onChange={() => toggleProduct(product._id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{product.title}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all products</p>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Active
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors mt-6"
                >
                  {editingId ? "Update Promocode" : "Create Promocode"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Promocode</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{promocodes.find((p) => p._id === showDeleteConfirm)?.code}"? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Loading promocodes...</div>
        ) : promocodes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No promocodes yet. Create your first one!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">All Promocodes</h3>
              <p className="text-sm text-gray-600 mt-1">Total: {promocodes.length} promocodes</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Discount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Products</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usage</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {promocodes.map((promo) => (
                    <tr key={promo._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900">{promo.code}</td>
                      <td className="px-6 py-4 text-gray-700">{promo.discountPercentage}%</td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{getPromoProductsText(promo)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {promo.usedCount} / {promo.usageLimit || "∞"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            promo.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {promo.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(promo)}
                            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(promo._id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
