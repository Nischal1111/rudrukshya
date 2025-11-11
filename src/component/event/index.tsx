"use client"
import { useState, useEffect, useMemo } from "react"
import { FaPlus, FaTrash } from "react-icons/fa"
import Image from "next/image"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllProduct } from "@/services/product"
import { getAllCategories } from "@/services/categories"
import { createEvent, getAllEvents, deleteEvent, addProductsToEvent } from "@/services/event"
import Loader from "../Loader"
import { Card } from "@/component/ui/card"

interface Product {
  _id: string
  title: string
  price: string
  category: string
  img: string[]
}

interface Event {
  _id?: string
  title: string
  bannerPopUpImage?: string
  bannerImage?: string[]
  products?: any[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  productsPagination?: {
    currentPage: number
    totalPages: number
    totalProducts: number
    limit: number
  }
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [openEventDialog, setOpenEventDialog] = useState(false)
  const [openProductDialog, setOpenProductDialog] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState<{ title: string }>({ title: "" })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const data = await getAllProduct(1, 1000) // Fetch all products
      setProducts(data?.products || [])
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.products?.map((p: Product) => p.category).filter(Boolean) || [])
      ) as string[]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to fetch products")
    }
  }

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await getAllEvents()
      // Handle response structure: { success: true, data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        setEvents(response.data)
      } else if (Array.isArray(response)) {
        setEvents(response)
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      // If endpoint doesn't exist, just set empty array
      setEvents([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchEvents()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Filter products by category
  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : products
  }, [products, selectedCategory])

  // Table columns for products
  const productColumns: ColumnDef<Product>[] = useMemo(() => [
    {
      id: "select",
      header: () => {
        const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedProducts.has(p._id))
        const someSelected = filteredProducts.some((p) => selectedProducts.has(p._id))
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  const allIds = new Set([...selectedProducts, ...filteredProducts.map((p) => p._id)])
                  setSelectedProducts(allIds)
                } else {
                  const filteredIds = new Set(filteredProducts.map((p) => p._id))
                  const newSelection = new Set([...selectedProducts].filter((id) => !filteredIds.has(id)))
                  setSelectedProducts(newSelection)
                }
              }}
              className="w-4 h-4 text-primaryColor cursor-pointer rounded"
            />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedProducts.has(row.original._id)}
            onChange={(e) => {
              const newSelection = new Set(selectedProducts)
              if (e.target.checked) {
                newSelection.add(row.original._id)
              } else {
                newSelection.delete(row.original._id)
              }
              setSelectedProducts(newSelection)
            }}
            className="w-4 h-4 text-primaryColor cursor-pointer rounded"
          />
        </div>
      ),
    },
    {
      accessorKey: "img",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex justify-center w-20 h-20">
          <Image
            src={(row.getValue("img") as string[])[0] || "/placeholder.svg"}
            alt="product"
            width={80}
            height={80}
            className="rounded-md w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: () => <div className="text-center">Title</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div className="text-center">{row.getValue("price")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="text-center capitalize">{row.getValue("category")}</div>,
    },
  ], [filteredProducts, selectedProducts, setSelectedProducts])

  const productTable = useReactTable({
    data: filteredProducts,
    columns: productColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  })

  // Handle create event
  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      alert("Please enter event title")
      return
    }

    if (events.length >= 2) {
      alert("Maximum 2 events allowed")
      return
    }

    try {
      await createEvent({ title: eventForm.title })
      setEventForm({ title: "" })
      setOpenEventDialog(false)
      await fetchEvents()
    } catch (err) {
      console.error("Error creating event:", err)
      alert("Failed to create event")
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) return

    try {
      await deleteEvent(eventId)
      await fetchEvents()
    } catch (err) {
      console.error("Error deleting event:", err)
      alert("Failed to delete event")
    }
  }

  // Handle add products to event
  const handleAddProductsToEvent = async (eventId: string) => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product")
      return
    }

    try {
      await addProductsToEvent(eventId, Array.from(selectedProducts))
      setSelectedProducts(new Set())
      setOpenProductDialog(null)
      await fetchEvents()
      alert("Products added successfully")
    } catch (err) {
      console.error("Error adding products to event:", err)
      alert("Failed to add products to event")
    }
  }

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
        <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-primaryColor hover:bg-primaryColor/90"
              disabled={events.length >= 2}
            >
              <FaPlus className="mr-2" />
              Add Event {events.length >= 2 && "(Max 2)"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Add a new event (Maximum 2 events allowed)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{event.title}</h2>
                {event.bannerPopUpImage && (
                  <div className="mt-2">
                    <Image
                      src={event.bannerPopUpImage}
                      alt={event.title}
                      width={100}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Products: {event.products?.length || 0}
                  {event.productsPagination && ` (Total: ${event.productsPagination.totalProducts})`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: {event.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={openProductDialog === event._id}
                  onOpenChange={(open) => {
                    setOpenProductDialog(open ? event._id || null : null)
                    if (!open) {
                      setSelectedProducts(new Set())
                      setSelectedCategory(null)
                      productTable.getColumn("title")?.setFilterValue("")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FaPlus className="mr-2" />
                      Add Products
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Products to {event.title}</DialogTitle>
                      <DialogDescription>
                        Select products to add to this event
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Search and Category Filter */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <Input
                          placeholder="Search products..."
                          value={(productTable.getColumn("title")?.getFilterValue() as string) ?? ""}
                          onChange={(event) => productTable.getColumn("title")?.setFilterValue(event.target.value)}
                          className="max-w-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Label>Filter by Category:</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                {selectedCategory || "All Categories"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                                All Categories
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {categories.map((cat) => (
                                <DropdownMenuItem
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                >
                                  {cat}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {selectedCategory && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCategory(null)}
                            >
                              Clear Filter
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Products Table */}
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            {productTable.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <TableHead key={header.id} className="text-center">
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(header.column.columnDef.header, header.getContext())}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {productTable.getRowModel().rows?.length ? (
                              productTable.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="text-center">
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={productColumns.length}
                                  className="h-24 text-center"
                                >
                                  No products found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Selected: {selectedProducts.size} product(s)
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpenProductDialog(null)
                          setSelectedProducts(new Set())
                          setSelectedCategory(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => event._id && handleAddProductsToEvent(event._id)}
                        disabled={selectedProducts.size === 0}
                      >
                        Add Selected Products ({selectedProducts.size})
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <FaTrash className="mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events created yet. Click "Add Event" to create your first event.</p>
        </div>
      )}
    </div>
  )
}

