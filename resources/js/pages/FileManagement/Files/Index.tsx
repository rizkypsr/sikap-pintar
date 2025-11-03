import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen } from 'lucide-react';
import { CategoryFilesDataTable } from '@/components/category-files-data-table';
import { FileEditDialog } from '@/components/file-edit-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUploadForm } from '@/components/file-upload-form';
import { File as FileType } from '@/components/file-columns';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
    department_id: number;
    created_by: number;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    department: Department;
}

interface File {
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
}

interface FilesIndexProps {
    category: Category;
    files: File[];
}

export default function FilesIndex({ category, files }: FilesIndexProps) {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleEdit = (file: File) => {
        setSelectedFile(file);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (file: File) => {
        if (confirm(`Apakah Anda yakin ingin menghapus file "${file.current_metadata?.filename}"?`)) {
            router.delete(`/files/${file.id}`, {
                onSuccess: () => {
                    toast.success('File berhasil dihapus');
                },
                onError: (errors) => {
                    console.error('Error deleting file:', errors);
                    toast.error('Gagal menghapus file. Silakan coba lagi.');
                }
            });
        }
    };

    console.log(category);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'File Management', href: '/file-management/departments' },
                { title: category.department.name, href: `/file-management/departments/${category.department.id}` },
                { title: category.name, href: '' },
            ]}
        >
            <Head title={`${category.name} - Files`} />

            <div className="space-y-6 p-2 sm:p-4 overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <FolderOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{category.name}</h1>
                            <p className="text-muted-foreground">
                                {category.description || "Kelola file dalam kategori ini"}
                            </p>
                        </div>
                    </div>

                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload File
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Upload File</DialogTitle>
                                <DialogDescription>
                                    Upload file ke kategori {category.name}. Maksimal ukuran file 20MB.
                                </DialogDescription>
                            </DialogHeader>
                            <FileUploadForm 
                                categoryId={category.id}
                                onSuccess={() => setIsUploadDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Files DataTable with proper width constraints */}
                <div className="w-full overflow-hidden">
                    <CategoryFilesDataTable 
                        files={files} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Edit Dialog */}
                <FileEditDialog
                    file={selectedFile}
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedFile(null);
                    }}
                />
            </div>
        </AppLayout>
    );
}