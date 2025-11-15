"use client"
import { useState, useEffect, useMemo } from "react"
import { FaPlus, FaTrash, FaEdit, FaMinus, FaSpinner } from "react-icons/fa"
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
import { 
  createEvent, 
  getAllEvents, 
  deleteEvent, 
  addProductsToEvent, 
  removeProductsFromEvent,
  updateEvent,
  getEventById
} from "@/services/event"
import Loader from "../Loader"
import { Card } from "@/component/ui/card"
import { toast } from "sonner"

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
  const [productsToRemove, setProductsToRemove] = useState<Set<string>>(new Set())
  const [openEventDialog, setOpenEventDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState<string | null>(null)
  const [openProductDialog, setOpenProductDialog] = useState<string | null>(null)
  const [openRemoveProductDialog, setOpenRemoveProductDialog] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState<{ title: string }>({ title: "" })
  const [editForm, setEditForm] = useState<{ title: string }>({ title: "" })
  const [bannerPopUpImage, setBannerPopUpImage] = useState<File | null>(null)
  const [bannerPopUpImagePreview, setBannerPopUpImagePreview] = useState<string>("")
  const [bannerImages, setBannerImages] = useState<File[]>([])
  const [bannerImagePreviews, setBannerImagePreviews] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Fetch all events with all products
  const fetchEvents = async () => {
    try {
      // Fetch with high limit to get all products
      const response = await getAllEvents(1, 1000)
      // Handle response structure: { success: true, data: [...] }
      let eventsData: Event[] = []
      if (response?.data && Array.isArray(response.data)) {
        eventsData = response.data
      } else if (Array.isArray(response)) {
        eventsData = response
      }
      
      // For each event, fetch full product details
      const eventsWithFullProducts = await Promise.all(
        eventsData.map(async (event) => {
          if (event._id) {
            try {
              const fullEvent = await getEventById(event._id)
              const eventData = fullEvent?.data || fullEvent
              
              // Ensure products array exists and is properly formatted
              let products = []
              if (eventData && eventData.products && Array.isArray(eventData.products)) {
                products = eventData.products.map((product: any) => ({
                  _id: product._id,
                  title: product.title || product.name || "",
                  name: product.name || product.title || "",
                  price: product.price || 0,
                  img: product.img || product.images || [],
                  images: product.images || product.img || [],
                  category: product.category || "",
                }))
              } else if (event.products && Array.isArray(event.products)) {
                // Fallback to event.products if eventData.products is not available
                products = event.products.map((product: any) => ({
                  _id: product._id || product,
                  title: product.title || product.name || "",
                  name: product.name || product.title || "",
                  price: product.price || 0,
                  img: product.img || product.images || [],
                  images: product.images || product.img || [],
                  category: product.category || "",
                }))
              }
              
              return {
                ...event,
                products: products,
                bannerPopUpImage: eventData?.bannerPopUpImage || event.bannerPopUpImage,
                bannerImage: eventData?.bannerImage || event.bannerImage,
              }
            } catch (err) {
              console.error(`Error fetching full event ${event._id}:`, err)
              // Return event with existing products if available
              return {
                ...event,
                products: event.products && Array.isArray(event.products) 
                  ? event.products.map((p: any) => ({
                      _id: p._id || p,
                      title: p.title || p.name || "",
                      name: p.name || p.title || "",
                      price: p.price || 0,
                      img: p.img || p.images || [],
                      images: p.images || p.img || [],
                      category: p.category || "",
                    }))
                  : []
              }
            }
          }
          return {
            ...event,
            products: event.products && Array.isArray(event.products) 
              ? event.products.map((p: any) => ({
                  _id: p._id || p,
                  title: p.title || p.name || "",
                  name: p.name || p.title || "",
                  price: p.price || 0,
                  img: p.img || p.images || [],
                  images: p.images || p.img || [],
                  category: p.category || "",
                }))
              : []
          }
        })
      )
      
      setEvents(eventsWithFullProducts)
      
      // Set active tab to first event if available
      if (eventsWithFullProducts.length > 0 && !activeTab) {
        setActiveTab(eventsWithFullProducts[0]._id || null)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
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

  // Get products available to add (exclude products already in the event)
  const availableProducts = useMemo(() => {
    if (!openProductDialog) return filteredProducts
    
    // Find the event that's currently open
    const currentEvent = events.find(e => e._id === openProductDialog)
    if (!currentEvent || !currentEvent.products || currentEvent.products.length === 0) {
      return filteredProducts
    }
    
    // Extract product IDs from the event (handle both object and string IDs)
    const eventProductIds = new Set(
      currentEvent.products.map((p: any) => {
        if (typeof p === 'string') return p
        return p._id || p
      })
    )
    
    // Filter out products that are already in the event
    return filteredProducts.filter((p) => !eventProductIds.has(p._id))
  }, [filteredProducts, openProductDialog, events])

  // Table columns for products
  const productColumns: ColumnDef<Product>[] = useMemo(() => [
    {
      id: "select",
      header: () => {
        const allSelected = availableProducts.length > 0 && availableProducts.every((p) => selectedProducts.has(p._id))
        const someSelected = availableProducts.some((p) => selectedProducts.has(p._id))
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
                  const allIds = new Set([...selectedProducts, ...availableProducts.map((p) => p._id)])
                  setSelectedProducts(allIds)
                } else {
                  const filteredIds = new Set(availableProducts.map((p) => p._id))
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
  ], [availableProducts, selectedProducts, setSelectedProducts])

  const productTable = useReactTable({
    data: availableProducts,
    columns: productColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  })

  // Handle create event
  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      toast.error("Please enter event title")
      return
    }

    if (events.length >= 2) {
      toast.error("Maximum 2 events allowed")
      return
    }

    if (!bannerPopUpImage) {
      toast.error("Please upload a banner popup image")
      return
    }

    if (bannerImages.length === 0) {
      toast.error("Please upload at least one banner image")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", eventForm.title)
      formData.append("bannerPopUpImage", bannerPopUpImage)
      bannerImages.forEach((img) => {
        formData.append("bannerImage", img)
      })

      await createEvent(formData)
      setEventForm({ title: "" })
      setBannerPopUpImage(null)
      setBannerPopUpImagePreview("")
      setBannerImages([])
      setBannerImagePreviews([])
      setOpenEventDialog(false)
      toast.success("Event created successfully")
      await fetchEvents()
    } catch (err: any) {
      console.error("Error creating event:", err)
      toast.error(err?.response?.data?.error || "Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit event
  const handleEditEvent = async (eventId: string) => {
    if (!editForm.title.trim()) {
      toast.error("Please enter event title")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", editForm.title)
      
      if (bannerPopUpImage) {
        formData.append("bannerPopUpImage", bannerPopUpImage)
      }
      
      if (bannerImages.length > 0) {
        bannerImages.forEach((img) => {
          formData.append("bannerImage", img)
        })
      }

      await updateEvent(eventId, formData)
      setEditForm({ title: "" })
      setBannerPopUpImage(null)
      setBannerPopUpImagePreview("")
      setBannerImages([])
      setBannerImagePreviews([])
      setOpenEditDialog(null)
      toast.success("Event updated successfully")
      await fetchEvents()
    } catch (err: any) {
      console.error("Error updating event:", err)
      toast.error(err?.response?.data?.error || "Failed to update event")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle open edit dialog
  const handleOpenEditDialog = async (eventId: string) => {
    try {
      const response = await getEventById(eventId)
      const event = response?.data || response
      setEditForm({
        title: event.title || ""
      })
      if (event.bannerPopUpImage) {
        setBannerPopUpImagePreview(event.bannerPopUpImage)
      }
      if (event.bannerImage && event.bannerImage.length > 0) {
        setBannerImagePreviews(event.bannerImage)
      }
      setOpenEditDialog(eventId)
    } catch (err) {
      console.error("Error fetching event:", err)
      toast.error("Failed to load event details")
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) return

    try {
      await deleteEvent(eventId)
      toast.success("Event deleted successfully")
      await fetchEvents()
    } catch (err: any) {
      console.error("Error deleting event:", err)
      toast.error(err?.response?.data?.error || "Failed to delete event")
    }
  }

  // Handle add products to event
  const handleAddProductsToEvent = async (eventId: string) => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product")
      return
    }

    try {
      await addProductsToEvent(eventId, Array.from(selectedProducts))
      setSelectedProducts(new Set())
      setOpenProductDialog(null)
      await fetchEvents()
      toast.success("Products added successfully")
    } catch (err: any) {
      console.error("Error adding products to event:", err)
      toast.error(err?.response?.data?.error || "Failed to add products to event")
    }
  }

  // Handle remove products from event
  const handleRemoveProductsFromEvent = async (eventId: string) => {
    if (productsToRemove.size === 0) {
      toast.error("Please select at least one product to remove")
      return
    }

    try {
      await removeProductsFromEvent(eventId, Array.from(productsToRemove))
      setProductsToRemove(new Set())
      setOpenRemoveProductDialog(null)
      await fetchEvents()
      toast.success("Products removed successfully")
    } catch (err: any) {
      console.error("Error removing products from event:", err)
      toast.error(err?.response?.data?.error || "Failed to remove products from event")
    }
  }

  // Handle banner popup image upload
  const handleBannerPopUpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerPopUpImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPopUpImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle banner images upload
  const handleBannerImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setBannerImages((prev) => [...prev, ...files])
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setBannerImagePreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
        <Dialog 
          open={openEventDialog} 
          onOpenChange={(open) => {
            setOpenEventDialog(open)
            if (!open) {
              setIsSubmitting(false)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-primaryColor hover:bg-primaryColor/90"
              disabled={events.length >= 2}
            >
              <FaPlus className="mr-2" />
              Add Event {events.length >= 2 && "(Max 2)"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              
              <div className="space-y-2">
                <Label htmlFor="bannerPopUpImage">Banner Popup Image *</Label>
                <Input
                  id="bannerPopUpImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerPopUpImageChange}
                />
                {bannerPopUpImagePreview && (
                  <div className="mt-2">
                    <Image
                      src={bannerPopUpImagePreview}
                      alt="Banner popup preview"
                      width={200}
                      height={120}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImages">Banner Images * (Multiple allowed)</Label>
                <Input
                  id="bannerImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBannerImagesChange}
                />
                {bannerImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {bannerImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={preview}
                          alt={`Banner ${index + 1}`}
                          width={150}
                          height={100}
                          className="rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            setBannerImages((prev) => prev.filter((_, i) => i !== index))
                            setBannerImagePreviews((prev) => prev.filter((_, i) => i !== index))
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                disabled={isSubmitting}
                onClick={() => {
                  setOpenEventDialog(false)
                  setEventForm({ title: "" })
                  setBannerPopUpImage(null)
                  setBannerPopUpImagePreview("")
                  setBannerImages([])
                  setBannerImagePreviews([])
                  setIsSubmitting(false)
                }}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} onClick={handleCreateEvent}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Tabs */}
      {events.length > 0 && (
        <div className="w-full">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
        {events.map((event) => (
              <button
                key={event._id}
                onClick={() => setActiveTab(event._id || null)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === event._id
                    ? "border-b-2 border-primaryColor text-primaryColor"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {event.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {events.map((event) => {
            if (activeTab !== event._id) return null
            
            return (
              <div key={event._id} className="space-y-6">
                {/* Event Header */}
                <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold">{event.title}</h2>
                      </div>
                      
                {event.bannerPopUpImage && (
                        <div className="mt-2 mb-4">
                          <Label className="text-xs text-muted-foreground mb-2 block">Popup Image:</Label>
                    <Image
                      src={event.bannerPopUpImage}
                      alt={event.title}
                            width={300}
                            height={180}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                      
                      {event.bannerImage && event.bannerImage.length > 0 && (
                        <div className="mt-2 mb-4">
                          <Label className="text-xs text-muted-foreground mb-2 block">Banner Images:</Label>
                          <div className="flex gap-2 flex-wrap">
                            {event.bannerImage.map((img, idx) => (
                              <Image
                                key={idx}
                                src={img}
                                alt={`${event.title} banner ${idx + 1}`}
                                width={150}
                                height={100}
                                className="rounded-md object-cover"
                              />
                            ))}
              </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
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

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => event._id && handleOpenEditDialog(event._id)}
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Button>

                      <Dialog
                        open={openEditDialog === event._id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setOpenEditDialog(null)
                            setEditForm({ title: "" })
                            setBannerPopUpImage(null)
                            setBannerPopUpImagePreview("")
                            setBannerImages([])
                            setBannerImagePreviews([])
                            setIsSubmitting(false)
                          }
                        }}
                      >
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                            <DialogDescription>Update event details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Event Title *</Label>
                              <Input
                                id="edit-title"
                                placeholder="Enter event title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-bannerPopUpImage">Banner Popup Image (Leave empty to keep current)</Label>
                              <Input
                                id="edit-bannerPopUpImage"
                                type="file"
                                accept="image/*"
                                onChange={handleBannerPopUpImageChange}
                              />
                              {(bannerPopUpImagePreview || event.bannerPopUpImage) && (
                                <div className="mt-2">
                                  <Image
                                    src={bannerPopUpImagePreview || event.bannerPopUpImage || ""}
                                    alt="Banner popup preview"
                                    width={200}
                                    height={120}
                                    className="rounded-md object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-bannerImages">Banner Images (Leave empty to keep current, or upload new ones)</Label>
                              <Input
                                id="edit-bannerImages"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleBannerImagesChange}
                              />
                              {(bannerImagePreviews.length > 0 || (event.bannerImage && event.bannerImage.length > 0)) && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {(bannerImagePreviews.length > 0 ? bannerImagePreviews : event.bannerImage || []).map((preview, index) => (
                                    <div key={index} className="relative">
                                      <Image
                                        src={preview}
                                        alt={`Banner ${index + 1}`}
                                        width={150}
                                        height={100}
                                        className="rounded-md object-cover"
                                      />
                                      {bannerImagePreviews.length > 0 && (
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-1 right-1"
                                          onClick={() => {
                                            setBannerImages((prev) => prev.filter((_, i) => i !== index))
                                            setBannerImagePreviews((prev) => prev.filter((_, i) => i !== index))
                                          }}
                                        >
                                          ×
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              disabled={isSubmitting}
                              onClick={() => {
                                setOpenEditDialog(null)
                                setEditForm({ title: "" })
                                setBannerPopUpImage(null)
                                setBannerPopUpImagePreview("")
                                setBannerImages([])
                                setBannerImagePreviews([])
                                setIsSubmitting(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              disabled={isSubmitting} 
                              onClick={() => event._id && handleEditEvent(event._id)}
                            >
                              {isSubmitting ? (
                                <>
                                  <FaSpinner className="mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Event"
                              )}
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

                {/* Products Table */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Products in {event.title}</h3>
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
                                        {availableProducts.length === 0 && openProductDialog ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <p className="text-muted-foreground">All available products are already added to this event.</p>
                                            <p className="text-sm text-muted-foreground">Remove products from the event to add them again.</p>
                                          </div>
                                        ) : (
                                          "No products found."
                                        )}
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

                      <Dialog
                        open={openRemoveProductDialog === event._id}
                        onOpenChange={(open) => {
                          setOpenRemoveProductDialog(open ? event._id || null : null)
                          if (!open) {
                            setProductsToRemove(new Set())
                            setSelectedCategory(null)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                            <FaMinus className="mr-2" />
                            Remove Products
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Remove Products from {event.title}</DialogTitle>
                            <DialogDescription>
                              Select products to remove from this event
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {event.products && event.products.length > 0 ? (
                              <div className="border rounded-md">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-center">Select</TableHead>
                                      <TableHead className="text-center">Image</TableHead>
                                      <TableHead className="text-center">Title</TableHead>
                                      <TableHead className="text-center">Price</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {event.products.map((product: any, index: number) => {
                                      const productImg = product.img || product.images
                                      const imgSrc = Array.isArray(productImg) 
                                        ? (productImg.length > 0 ? productImg[0] : null)
                                        : productImg
                                      const productId = product._id || product
                                      
                                      return (
                                        <TableRow key={productId || index}>
                                          <TableCell className="text-center">
                                            <input
                                              type="checkbox"
                                              checked={productsToRemove.has(productId)}
                                              onChange={(e) => {
                                                const newSelection = new Set(productsToRemove)
                                                if (e.target.checked) {
                                                  newSelection.add(productId)
                                                } else {
                                                  newSelection.delete(productId)
                                                }
                                                setProductsToRemove(newSelection)
                                              }}
                                              className="w-4 h-4 text-primaryColor cursor-pointer rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {imgSrc ? (
                                              <Image
                                                src={imgSrc}
                                                alt={product.title || product.name || "Product"}
                                                width={60}
                                                height={60}
                                                className="rounded-md object-cover mx-auto"
                                              />
                                            ) : (
                                              <div className="w-15 h-15 bg-gray-200 rounded-md mx-auto flex items-center justify-center">
                                                <span className="text-xs text-gray-400">No Image</span>
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {product.title || product.name || "N/A"}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {product.price ? `$${product.price}` : "N/A"}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground">No products in this event</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Selected: {productsToRemove.size} product(s)
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setOpenRemoveProductDialog(null)
                                setProductsToRemove(new Set())
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => event._id && handleRemoveProductsFromEvent(event._id)}
                              disabled={productsToRemove.size === 0}
                              variant="destructive"
                            >
                              Remove Selected Products ({productsToRemove.size})
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Products Display Table */}
                  {event.products && Array.isArray(event.products) && event.products.length > 0 ? (
                    <div className="border rounded-md mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">Image</TableHead>
                            <TableHead className="text-center">Title</TableHead>
                            <TableHead className="text-center">Price</TableHead>
                            <TableHead className="text-center">Category</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.products.map((product: any, index: number) => {
                            // Handle case where product might be just an ID string
                            if (typeof product === 'string') {
                              return (
                                <TableRow key={product || index}>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Product ID: {product} (Details not loaded)
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            
                            const productImg = product.img || product.images
                            const imgSrc = Array.isArray(productImg) 
                              ? (productImg.length > 0 ? productImg[0] : null)
                              : productImg
                            
                            return (
                              <TableRow key={product._id || product || index}>
                                <TableCell className="text-center">
                                  {imgSrc ? (
                                    <Image
                                      src={imgSrc}
                                      alt={product.title || product.name || "Product"}
                                      width={80}
                                      height={80}
                                      className="rounded-md object-cover mx-auto"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gray-200 rounded-md mx-auto flex items-center justify-center">
                                      <span className="text-xs text-gray-400">No Image</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {product.title || product.name || "N/A"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {product.price ? `$${product.price}` : "N/A"}
                                </TableCell>
                                <TableCell className="text-center capitalize">
                                  {product.category || "N/A"}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground mt-4">
                      <p>No products added to this event yet.</p>
                      <p className="text-sm mt-2">Click "Add Products" to add products to this event.</p>
                    </div>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events created yet. Click "Add Event" to create your first event.</p>
        </div>
      )}
    </div>
  )
}

