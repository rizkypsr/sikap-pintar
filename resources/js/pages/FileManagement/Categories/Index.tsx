import AppLayout from '@/layouts/app-layout';
import { type Department, type Category } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useState, useEffect, useMemo } from 'react';
import { FolderIcon } from '@phosphor-icons/react';

interface Props {
    department: Department;
    categories: Category[];
    search?: string;
}

export default function Show({ department, categories, search: initialSearch = '' }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isMathVerificationOpen, setIsMathVerificationOpen] = useState(false);
    const [isFinalConfirmationOpen, setIsFinalConfirmationOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [mathProblem, setMathProblem] = useState({ num1: 0, num2: 0, answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [search, setSearch] = useState(initialSearch);

    // Filter categories based on search term (frontend only)
    const filteredCategories = useMemo(() => {
        if (!search.trim()) {
            return categories;
        }

        return categories.filter(category =>
            category.name.toLowerCase().includes(search.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
        );
    }, [categories, search]);

    const createForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    const deleteForm = useForm();

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`/file-management/departments/${department.id}/categories`, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            description: category.description || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        editForm.put(`/file-management/departments/${department.id}/categories/${editingCategory.id}`, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteCategory = (category: Category) => {
        setDeletingCategory(category);
        // Generate random math problem
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        setMathProblem({ num1, num2, answer: num1 + num2 });
        setUserAnswer('');
        setIsMathVerificationOpen(true);
    };

    const handleMathVerification = () => {
        if (parseInt(userAnswer) === mathProblem.answer) {
            setIsMathVerificationOpen(false);
            setIsFinalConfirmationOpen(true);
        } else {
            alert('Jawaban salah! Silakan coba lagi.');
            setUserAnswer('');
        }
    };

    const confirmDeleteCategory = () => {
        if (deletingCategory) {
            deleteForm.delete(`/file-management/departments/${department.id}/categories/${deletingCategory.id}`, {
                onSuccess: () => {
                    setIsFinalConfirmationOpen(false);
                    setDeletingCategory(null);
                    setUserAnswer('');
                },
                onError: () => {
                    // Dialog tetap terbuka jika ada error
                }
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'File Management', href: '/file-management/departments' },
                { title: department.name, href: '' },
            ]}
        >
            <Head title={`${department.name} - File Management`} />

            <div className="space-y-6 p-2 sm:p-4 overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{department.name}</h1>
                            <p className="text-muted-foreground">
                                Manajemen kategori dan file untuk bidang ini
                            </p>
                        </div>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kategori
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreateCategory}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Kategori</DialogTitle>
                                    <DialogDescription>
                                        Tambahkan kategori baru untuk mengorganisir file di {department.name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Kategori</Label>
                                        <Input
                                            id="name"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="Nama Kategori"
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Input
                                            id="description"
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Deskripsi Kategori (opsional)"
                                        />
                                        {createForm.errors.description && (
                                            <p className="text-sm text-destructive">{createForm.errors.description}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing}>
                                        {createForm.processing ? 'Menambah...' : 'Tambah Kategori'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Data Table untuk menampilkan kategori */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {/* Search Area */}
                    <div className="py-2 sm:py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Cari kategori..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 w-full sm:w-auto"
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="flex-1 overflow-auto">
                        <div className="rounded-md border flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                            <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Nama</th>
                                            <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Deskripsi</th>
                                            <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="categories-tbody" className="[&_tr:last-child]:border-0">
                                        {filteredCategories.map((category: Category) => (
                                            <tr key={category.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                                                <td className="p-2 align-middle whitespace-nowrap">
                                                    <Link
                                                        href={`/file-management/departments/${department.id}/categories/${category.id}/files`}
                                                        className="flex items-center gap-2 hover:text-primary"
                                                    >
                                                        <FolderIcon size={28} weight='regular' className="h-4 w-4" />
                                                        {category.name}
                                                    </Link>
                                                </td>
                                                <td className="p-2 align-middle whitespace-nowrap">
                                                    {category.description || '-'}
                                                </td>
                                                <td className="p-2 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditCategory(category)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteCategory(category)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCategories.length === 0 && search.trim() && (
                                            <tr>
                                                <td colSpan={3} className="h-24 text-center">
                                                    Tidak ada kategori yang cocok dengan pencarian "{search}".
                                                </td>
                                            </tr>
                                        )}
                                        {filteredCategories.length === 0 && !search.trim() && (
                                            <tr>
                                                <td colSpan={3} className="h-24 text-center">
                                                    Tidak ada kategori.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Category Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleUpdateCategory}>
                            <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                    Update the category information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="Nama Kategori"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-destructive">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Deskripsi</Label>
                                    <Input
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        placeholder="Deskripsi Kategori (opsional)"
                                    />
                                    {editForm.errors.description && (
                                        <p className="text-sm text-destructive">{editForm.errors.description}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Mengubah...' : 'Ubah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Math Verification Dialog */}
                <Dialog open={isMathVerificationOpen} onOpenChange={setIsMathVerificationOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Verifikasi Penghapusan</DialogTitle>
                            <DialogDescription>
                                Untuk melanjutkan penghapusan kategori "{deletingCategory?.name}",
                                silakan jawab pertanyaan matematika berikut:
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">
                                    {mathProblem.num1} + {mathProblem.num2} = ?
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="math-answer">Jawaban Anda:</Label>
                                <Input
                                    id="math-answer"
                                    type="number"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Masukkan jawaban"
                                    className="text-center"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleMathVerification}
                                disabled={!userAnswer}
                            >
                                Verifikasi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Final Confirmation Dialog */}
                <Dialog open={isFinalConfirmationOpen} onOpenChange={setIsFinalConfirmationOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Penghapusan Kategori</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-2">
                                    <div>
                                        Anda akan menghapus kategori "{deletingCategory?.name}".
                                    </div>
                                    <div className="font-semibold text-destructive">
                                        ⚠️ PERINGATAN: Menghapus kategori ini akan menghapus SELURUH FILE yang ada di dalamnya!
                                    </div>
                                    <div>
                                        Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={deleteForm.processing}>
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteCategory}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Kategori & Semua File'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}