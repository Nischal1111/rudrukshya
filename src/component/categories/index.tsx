"use client";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MdDelete } from "react-icons/md";
import {
  createSubCategory,
  createSubCategoryByName,
  deleteSubCategory,
  getAllCategories,
} from "@/services/categories";
import { FaPlus } from "react-icons/fa6";
import { HiOutlineSearch } from "react-icons/hi";
import Loader from "../Loader";

export type Payment = {
  _id: string;
  fullName: string;
  phone: number;
  email: string;
  address: string;
};

export default function Categories() {
  const [users, setUsers] = useState<Payment[]>([]);
  const [users1, setUsers1] = useState<Payment[]>([]);
  const [users2, setUsers2] = useState<Payment[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchMala, setSearchMala] = useState("");
  const [searchBracelet, setSearchBracelet] = useState("");
  const [searchBeads, setSearchBeads] = useState("");
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const handleDelete = async (id: string) => {
    try {
      console.log(id);
      await deleteSubCategory(id, token);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const columns: ColumnDef<Payment>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Sub Category",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                <MdDelete className="h-5 w-5" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  category and remove the data from your servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border border-gray-300">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(row.original._id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ], [token]);

  const malaTable = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const braceletTable = useReactTable({
    data: users1,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const beadsTable = useReactTable({
    data: users2,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const fetchData = async () => {
    try {
      const data = await getAllCategories();
      // Find categories by name
      const malaCategory = data.find((cat: any) => cat.name?.toLowerCase() === "mala");
      const braceletCategory = data.find((cat: any) => cat.name?.toLowerCase() === "bracelet");
      const beadsCategory = data.find((cat: any) => cat.name?.toLowerCase() === "beads");

      setUsers(malaCategory?.subCategories || []);
      setUsers1(braceletCategory?.subCategories || []);
      setUsers2(beadsCategory?.subCategories || []);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setLoading(false);
    }
  };

  const handleAddCategory = async (category: string) => {
    try {
      if (category === "Bracelet") {
        await createSubCategory("67cd4f5f31a134d9c96b97db", name, token);
      } else if (category === "Mala") {
        await createSubCategory("67cd4fc131a134d9c96b97df", name, token);
      } else if (category === "Beads") {
        await createSubCategoryByName("Beads", name, token);
      }

      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchMala) {
      malaTable.getColumn("name")?.setFilterValue(searchMala);
    }
  }, [searchMala, malaTable]);

  useEffect(() => {
    if (searchBracelet) {
      braceletTable.getColumn("name")?.setFilterValue(searchBracelet);
    }
  }, [searchBracelet, braceletTable]);

  useEffect(() => {
    if (searchBeads) {
      beadsTable.getColumn("name")?.setFilterValue(searchBeads);
    }
  }, [searchBeads, beadsTable]);

  if (loading) return <Loader />;
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-red-50 text-red-500">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mala Categories Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primaryColor/90 p-4">
              <h2 className="text-xl font-semibold text-white">Mala Categories</h2>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search categories..."
                    value={searchMala}
                    onChange={(e) => setSearchMala(e.target.value)}
                    className="pl-10 py-2"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primaryColor hover:bg-primaryColor/90  text-white">
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Add New Mala Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mala-name" className="text-right font-medium">
                          Category Name
                        </Label>
                        <Input
                          id="mala-name"
                          placeholder="Enter category name"
                          onChange={(e) => setName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-primaryColor hover:bg-primaryColor/90"
                        onClick={() => handleAddCategory("Mala")}
                      >
                        Save Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    {malaTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="bg-gray-50">
                        {headerGroup.headers.map((header) => (
                          <TableHead className="text-center font-semibold" key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {malaTable.getRowModel().rows?.length ? (
                      malaTable.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-gray-50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-center">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500"
                        >
                          No categories found.
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
                  onClick={() => malaTable.previousPage()}
                  disabled={!malaTable.getCanPreviousPage()}
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => malaTable.nextPage()}
                  disabled={!malaTable.getCanNextPage()}
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Bracelet Categories Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primaryColor/90 p-4">
              <h2 className="text-xl font-semibold text-white">Bracelet Categories</h2>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search categories..."
                    value={searchBracelet}
                    onChange={(e) => setSearchBracelet(e.target.value)}
                    className="pl-10 py-2"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primaryColor hover:bg-primaryColor/90 text-white">
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Add New Bracelet Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bracelet-name" className="text-right font-medium">
                          Category Name
                        </Label>
                        <Input
                          id="bracelet-name"
                          placeholder="Enter category name"
                          onChange={(e) => setName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleAddCategory("Bracelet")}
                        className="bg-primaryColor hover:bg-primaryColor/90"
                      >
                        Save Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    {braceletTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="bg-gray-50">
                        {headerGroup.headers.map((header) => (
                          <TableHead className="text-center font-semibold" key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {braceletTable.getRowModel().rows?.length ? (
                      braceletTable.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-gray-50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-center">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500"
                        >
                          No categories found.
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
                  onClick={() => braceletTable.previousPage()}
                  disabled={!braceletTable.getCanPreviousPage()}
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => braceletTable.nextPage()}
                  disabled={!braceletTable.getCanNextPage()}
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Beads Categories Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primaryColor/90 p-4">
              <h2 className="text-xl font-semibold text-white">Beads Categories</h2>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search categories..."
                    value={searchBeads}
                    onChange={(e) => setSearchBeads(e.target.value)}
                    className="pl-10 py-2"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primaryColor hover:bg-primaryColor/90 text-white">
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Add New Beads Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="beads-name" className="text-right font-medium">
                          Category Name
                        </Label>
                        <Input
                          id="beads-name"
                          placeholder="Enter category name"
                          onChange={(e) => setName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleAddCategory("Beads")}
                        className="bg-primaryColor hover:bg-primaryColor/90"
                      >
                        Save Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    {beadsTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="bg-gray-50">
                        {headerGroup.headers.map((header) => (
                          <TableHead className="text-center font-semibold" key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {beadsTable.getRowModel().rows?.length ? (
                      beadsTable.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-gray-50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-center">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500"
                        >
                          No categories found.
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
                  onClick={() => beadsTable.previousPage()}
                  disabled={!beadsTable.getCanPreviousPage()}
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => beadsTable.nextPage()}
                  disabled={!beadsTable.getCanNextPage()}
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}