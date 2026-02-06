"use client"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { MdOutlineModeEditOutline, MdDelete } from "react-icons/md"
import { FaPlus } from "react-icons/fa"
import Link from "next/link"
import Image from "next/image"

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TailwindSwitch } from "@/components/ui/switch"
import { deleteProduct, toggleProductField, getAllProduct, searchProduct } from "@/services/product"
import Loader from "../Loader"

export type Payment = {
  _id?: string
  title: string
  price: string
  category: string
  img: string[]
  isSpecial: boolean
  isTopSelling: boolean
  isExclusive: boolean
  isSale?: boolean
}

// --- Main Component ---
export default function ProductsList() {
  const [users, setUsers] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rowSelection, setRowSelection] = useState({})
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const { data: session } = useSession()
  const token = (session?.user as any)?.jwt || ""

  // --- Debounce search term ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // --- Delete product handler ---
  const handleDelete = async (id: string | undefined) => {
    try {
      if (id) await deleteProduct(id, token)
      window.location.reload()
    } catch (err) {
      console.error("Error deleting product:", err)
    }
  }

  // --- Toggle boolean fields handler ---
  const handleToggleSpecial = async (id: string | undefined, field: string) => {
    try {
      if (!id) return
      await toggleProductField(id, field, token)
    } catch (err) {
      console.error("Error updating product:", err)
    }
  }

  // --- Table Columns ---
  const columns: ColumnDef<Payment>[] = useMemo(() => [
    {
      accessorKey: "img",
      header: "Image",
      cell: ({ row }) => (
        <div className="capitalize flex justify-center align-center w-20 h-20">
          <Image
            src={(row.getValue("img") as string[])[0] || "/placeholder.svg"}
            alt="image"
            width={80}
            height={80}
            className="rounded-md w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: () => <div className="capitalize text-center">Title</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div className="capitalize text-center">{row.getValue("price") || "Contact Us"}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="capitalize text-center">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "isSpecial",
      header: "Special",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TailwindSwitch
            checked={row.getValue("isSpecial") as boolean}
            onCheckedChange={() => handleToggleSpecial(row.original._id, "isSpecial")}
          />
        </div>
      ),
    },
    {
      accessorKey: "isTopSelling",
      header: "Top Selling",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TailwindSwitch
            checked={row.getValue("isTopSelling") as boolean}
            onCheckedChange={() => handleToggleSpecial(row.original._id, "isTopSelling")}
          />
        </div>
      ),
    },
    {
      accessorKey: "isExclusive",
      header: "Exclusive",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TailwindSwitch
            checked={row.getValue("isExclusive") as boolean}
            onCheckedChange={() => handleToggleSpecial(row.original._id, "isExclusive")}
          />
        </div>
      ),
    },
    {
      header: "Action ",
      cell: ({ row }) => (
        <div className="flex gap-5 justify-center">
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <MdDelete className="text-red-600 text-xl" />
                  <h1 className="text-red-600">Delete</h1>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product and remove its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600" onClick={() => handleDelete(row.original._id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div>
            <Link href={`/products/product/${row.original._id}`} passHref>
              <Button variant="outline">
                <MdOutlineModeEditOutline className="text-xl " />
                <h1>Edit</h1>
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ], [token])

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  // --- Fetch Data ---
  const fetchData = async (pageNum: number, limit: number, filter?: string, search?: string) => {
    try {
      let data;
      if (search) {
        data = await searchProduct(search, pageNum, limit)
      } else {
        const filterBy: string[] = []
        const filterValue: string[] = []

        if (filter) {
          filterBy.push(filter)
          filterValue.push("true")
        }

        const query = new URLSearchParams({
          page: String(pageNum),
          limit: String(limit),
          ...(filterBy.length && { filterBy: filterBy.join(",") }),
          ...(filterValue.length && { filterValue: filterValue.join(",") }),
        })

        data = await getAllProduct(query.toString())
      }

      setPage(data.pagination.currentPage || pageNum)
      setTotalPages(data.pagination.totalPages || 1)
      setUsers(data?.products || [])
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData(1, 8, selectedFilter || undefined, debouncedSearchTerm)
  }, [debouncedSearchTerm, selectedFilter])

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (loading) return <Loader />
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      {/* 🔍 Search + Filter Bar */}
      <div className="flex items-center py-4 justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search Product"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{selectedFilter ? `Filter: ${selectedFilter}` : "Filter"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFilterSelect("exclusive")}>Exclusive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("topSelling")}>Top Selling</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("special")}>Special</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect("sale")}>Discount</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedFilter(null)
                  fetchData(1, 8)
                }}
              >
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/products/product/new" passHref>
            <Button className="bg-primaryColor hover:bg-primaryColor/90 text-sm ml-5">
              <FaPlus className="text-base text-white " />
              <h1 className="text-white text-base">Add Product</h1>
            </Button>
          </Link>
        </div>


      </div>

      {/* 🧾 Product Table */}
      <div className="rounded-md border w-[77rem]">
        <Table>
          <TableHeader className="text-xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-center" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page - 1, 8, selectedFilter || undefined, debouncedSearchTerm)}
          disabled={page === 1}
        >
          Previous
        </Button>
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? "default" : "outline"}
            size="sm"
            onClick={() => fetchData(pageNum, 8, selectedFilter || undefined, debouncedSearchTerm)}
          >
            {pageNum}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page + 1, 8, selectedFilter || undefined, debouncedSearchTerm)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
