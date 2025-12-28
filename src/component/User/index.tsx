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
import { ArrowUpDown } from "lucide-react";

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

import { deleteUser, getAllUser } from "@/services/user";
import Loader from "../Loader";

export type Payment = {
  _id: string;
  fullName: string;
  phone: number;
  email: string;
  address: string;
};

export default function User() {
  const [users, setUsers] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextDisable, setNextDisable] = useState(false);
  const [previousDisable, setPreviousDisable] = useState(true);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { data: session } = useSession();
  const token = (session?.user as any)?.jwt || "";

  const handleDelete = async (id: string) => {
    try {
      console.log(id);
      await deleteUser(id, token);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const columns: ColumnDef<Payment>[] = useMemo(() => [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <div className=" capitalize text-center ml-5">
          Name
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className=" capitalize text-center">{row.getValue("fullName")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("email")}</div>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="capitalize text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <MdDelete className="text-red-600 ml-2 text-xl" />
                <h1 className="text-red-600 text-left">Delete</h1>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  account and remove the data from your servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600"
                  onClick={() => handleDelete(row.original._id)}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ], [token]);

  const table = useReactTable({
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

  const fetchData = async (page: number, limit: number) => {
    try {
      const data = await getAllUser(page, limit, token);

      setPage(data.currentPage);
      if (data.currentPage === data.totalPages) {
        setNextDisable(true);
      } else {
        setNextDisable(false);
      }
      if (data.currentPage === 1) {
        setPreviousDisable(true);
      } else {
        setPreviousDisable(false);
      }
      console.log(data);
      setUsers(data?.users);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, 10);
  }, []);

  if (loading) return <Loader />
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name  ..."
          value={
            (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border w-[45rem]">
        <Table>
          <TableHeader className="text-xl text-center">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-xl text-center" key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
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
          onClick={() => fetchData(page - 1, 10)}
          disabled={previousDisable}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(page + 1, 10)}
          disabled={nextDisable}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
