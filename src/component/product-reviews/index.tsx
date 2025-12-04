"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Eye, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllProduct } from "@/services/product"
import Loader from "../Loader"
import ProductReviewModal from "./product-review-modal"

interface Product {
  _id: string
  title: string
  price: string
  category: string
  img: string[]
  reviews?: any[]
}

export default function ProductReviews() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { data: session } = useSession()

  // Fetch products
  const fetchData = async (pageNum: number, limit: number) => {
    try {
      setLoading(true)
      const data = await getAllProduct(pageNum, limit)
      setPage(data.pagination.currentPage)
      setTotalPages(data.pagination.totalPages)
      setProducts(data?.products || [])
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, 10)
  }, [])

  const handleViewReviews = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && products.length === 0) return <Loader />
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="w-16 h-16 relative">
                      <Image
                        src={product.img?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReviews(product)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Reviews
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page - 1, 10)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page + 1, 10)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <ProductReviewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={selectedProduct}
          token={(session?.user as any)?.jwt || ""}
          onSuccess={() => {
            // Optionally refresh product list
          }}
        />
      )}
    </div>
  )
}

