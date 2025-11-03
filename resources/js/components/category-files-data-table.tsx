import { useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { createFileColumns, File } from '@/components/file-columns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CategoryFilesDataTableProps {
    files: File[];
    onEdit?: (file: File) => void;
    onDelete?: (file: File) => void;
}

export function CategoryFilesDataTable({ files, onEdit, onDelete }: CategoryFilesDataTableProps) {
    const [search, setSearch] = useState('');

    // Filter files based on search term
    const filteredFiles = useMemo(() => {
        if (!search.trim()) return files;
        
        const searchTerm = search.toLowerCase();
        return files.filter(file => 
            file.current_metadata?.filename?.toLowerCase().includes(searchTerm) ||
            file.current_metadata?.mime_type?.toLowerCase().includes(searchTerm)
        );
    }, [files, search]);

    const columns = createFileColumns(onEdit, onDelete);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari file..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
            
            <DataTable
                columns={columns}
                data={filteredFiles}
            />
        </div>
    );
}