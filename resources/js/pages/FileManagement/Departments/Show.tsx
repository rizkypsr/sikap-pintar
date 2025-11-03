import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { type Department } from "@/types";
import { Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  department_id: number;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  files_count?: number;
}

interface DepartmentShowProps {
  department: Department;
  categories?: Category[];
  search?: string;
}

export default function DepartmentShow({ department, categories = [], search: initialSearch = '' }: DepartmentShowProps) {
  const [search, setSearch] = useState(initialSearch);

  console.log(categories);
  

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.get(`/file-management/departments/${department.id}`, 
        { search }, 
        { 
          preserveState: true,
          preserveScroll: true,
          replace: true
        }
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, department.id]);

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'File Management', href: '/file-management/departments' },
        { title: department.name, href: '' },
      ]}
    >
      <Head title={`${department.name} - Categories`} />

      <div className="space-y-6 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{department.name}</h1>
            <p className="text-muted-foreground">
              Manage categories and files for this department
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.name}
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                )}
                <div className="text-2xl font-bold">{category.files_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Files
                </p>
                <div className="mt-4">
                  <Link href={`/file-management/departments/${department.id}/categories/${category.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      View Files
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'Try adjusting your search terms.' : 'Get started by creating a new category.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}