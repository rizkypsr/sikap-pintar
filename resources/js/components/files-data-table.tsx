import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { createFileColumns, File } from '@/components/file-columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Search, FileText } from 'lucide-react';
import axios from 'axios';

interface FilesDataTableProps {
  categoryId?: number;
  onFileDeleted?: () => void;
  className?: string;
}

interface ApiResponse {
  data: File[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function FilesDataTable({ categoryId, onFileDeleted, className }: FilesDataTableProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);

  const fetchFiles = async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
      });

      if (categoryId) {
        params.append('category_id', categoryId.toString());
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await axios.get<ApiResponse>(`/files?${params.toString()}`);
      
      if (append && page > 1) {
        setFiles(prev => [...prev, ...response.data.data]);
      } else {
        setFiles(response.data.data);
      }
      
      setCurrentPage(response.data.meta.current_page);
      setHasNextPage(response.data.meta.current_page < response.data.meta.last_page);
      setTotalFiles(response.data.meta.total);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Gagal memuat data file. Silakan coba lagi.');
      if (!append) {
        setFiles([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFiles(1, searchTerm);
  }, [categoryId]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFiles(1, searchTerm);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchFiles(1, searchTerm);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchFiles(nextPage, searchTerm, true);
    }
  };

  const handleFileDeleted = () => {
    handleRefresh();
    onFileDeleted?.();
  };

  // Create columns with delete callback
  const columns = createFileColumns();

  if (loading && files.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data file...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar File
            {totalFiles > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalFiles} file)
              </span>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {files.length === 0 && !loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada file yang ditemukan</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Coba ubah kata kunci pencarian atau{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    setSearchTerm('');
                    fetchFiles(1, '');
                  }}
                >
                  tampilkan semua file
                </Button>
              </p>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={files}
            searchKey="current_metadata.filename"
            searchPlaceholder="Cari nama file..."
            hasNextPage={hasNextPage}
            isLoading={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </CardContent>
    </Card>
  );
}