"use client"

import { ColumnDef } from "@tanstack/react-table"
import { type Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ArrowUpDown, MoreHorizontal, Edit } from "lucide-react"
import { FolderIcon } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Link } from "@inertiajs/react"
import { show as categoriesShow } from "@/routes/file-management/departments/categories"

interface CategoryColumnsProps {
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export const createCategoryColumns = ({ onEdit, onDelete }: CategoryColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nama Kategori
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const category = row.original;
        return (
          <Link
            href={categoriesShow({ department: category.department_id, category: category.id }).url}
            className="font-medium hover:underline hover:text-primary flex items-center gap-2"
          >
            <FolderIcon size={28} className="text-primary" weight="regular" />
            {category.name}
          </Link>
        );
      },
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {description || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tanggal Dibuat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "dd MMM yyyy", { locale: id })}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const category = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]