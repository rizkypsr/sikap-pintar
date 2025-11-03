import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type Department } from "@/types";
import { Link } from "@inertiajs/react";

interface DepartmentsIndexProps {
  departments: Department[];
}

export default function DepartmentsIndex({ departments }: DepartmentsIndexProps) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'File Management', href: '' },
      ]}
    >
      <Head title="File Management - Departments" />

      <div className="space-y-6 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Select a department to manage its categories and files
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {department.name}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{department.categories_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Categories
                </p>
                <div className="mt-4">
                  <Link href={`/file-management/departments/${department.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      View Categories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No departments</h3>
            <p className="mt-1 text-sm text-gray-500">
              No departments have been created yet.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}