import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Trash2, Edit } from "lucide-react";
import {
  FileTextIcon,
  FileImageIcon,
  FilePdfIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileZipIcon,
  FileIcon,
  MicrosoftWordLogoIcon
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { router } from "@inertiajs/react";

export type File = {
  id: number;
  category_id: number;
  current_metadata_id: number;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  current_metadata: {
    id: number;
    filename: string;
    storage_path: string;
    mime_type: string;
    size: number;
    source_action: string;
    created_by: number;
    created_at: string;
    human_readable_size: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
  };
};

// Function to get file icon based on MIME type
const getFileIcon = (mimeType: string) => {
  const iconProps = { size: 28, className: "text-primary" };

  if (mimeType.startsWith('image/')) {
    return <FileImageIcon {...iconProps} />;
  } else if (mimeType === 'application/pdf') {
    return <FilePdfIcon {...iconProps} />;
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return <MicrosoftWordLogoIcon {...iconProps} />;
  } else if (mimeType.includes('word')) {
    return <MicrosoftWordLogoIcon {...iconProps} />;
  } else if (mimeType.includes('document')) {
    return <FileTextIcon {...iconProps} />;
  } else if (mimeType.startsWith('video/')) {
    return <FileVideoIcon {...iconProps} />;
  } else if (mimeType.startsWith('audio/')) {
    return <FileAudioIcon {...iconProps} />;
  } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return <FileZipIcon {...iconProps} />;
  } else if (mimeType.startsWith('text/')) {
    return <FileTextIcon {...iconProps} />;
  } else {
    return <FileIcon {...iconProps} />;
  }
};

export const createFileColumns = (
  onEdit?: (file: File) => void,
  onDelete?: (file: File) => void
): ColumnDef<File>[] => [
  {
    id: "current_metadata.filename",
    accessorKey: "current_metadata.filename",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const filename = row.original.current_metadata?.filename || "Unknown";
      const mimeType = row.original.current_metadata?.mime_type || "";
      const file = row.original;

      return (
        <div
          className="font-medium cursor-pointer hover:text-primary hover:underline flex items-center gap-2"
          onClick={() => {
            // Handle download by navigating to download route
            window.location.href = `/files/${file.id}/download`;
          }}
        >
          {getFileIcon(mimeType)}
          {filename}
        </div>
      );
    },
  },
  {
    accessorKey: "current_metadata.mime_type",
    header: "Type",
    cell: ({ row }) => {
      const mimeType = row.original.current_metadata?.mime_type || "Unknown";

      // Shorten common MIME types for better display
      const getDisplayType = (mimeType: string) => {
        const typeMap: { [key: string]: string } = {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
          "application/vnd.ms-excel": "Excel",
          "application/pdf": "PDF",
          "application/msword": "Word",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
          "application/vnd.ms-powerpoint": "PowerPoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
          "image/jpeg": "JPEG",
          "image/png": "PNG",
          "image/gif": "GIF",
          "text/plain": "Text",
          "text/csv": "CSV",
        };

        return typeMap[mimeType] || mimeType;
      };

      return <div className="text-sm text-muted-foreground">{getDisplayType(mimeType)}</div>;
    },
  },
  {
    accessorKey: "current_metadata.size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Size
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const size = row.original.current_metadata?.human_readable_size || "Unknown";
      return <div>{size}</div>;
    },
  },
  {
    accessorKey: "creator.name",
    header: "Uploaded By",
    cell: ({ row }) => {
      const creator = row.original.creator?.name || "Unknown";
      return <div>{creator}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Upload Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{format(date, "dd/MM/yyyy HH:mm")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const file = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // Handle view/detail
                console.log("View file details:", file.id);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (onEdit) {
                  onEdit(file);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (onDelete) {
                  onDelete(file);
                }
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];