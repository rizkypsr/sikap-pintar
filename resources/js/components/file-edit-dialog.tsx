import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { File } from '@/components/file-columns';
import { toast } from 'sonner';

interface FileEditDialogProps {
    file: File | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FileEditDialog({ file, isOpen, onClose }: FileEditDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        filename: file?.current_metadata?.filename || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) return;

        put(`/files/${file.id}`, {
            onSuccess: () => {
                toast.success('Nama file berhasil diubah');
                onClose();
                reset();
            },
            onError: (errors) => {
                console.error('Edit error:', errors);
                toast.error('Gagal mengubah nama file. Silakan coba lagi.');
            }
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Update form data when file changes
    React.useEffect(() => {
        if (file?.current_metadata?.filename) {
            setData('filename', file.current_metadata.filename);
        }
    }, [file]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Nama File</DialogTitle>
                    <DialogDescription>
                        Ubah nama file "{file?.current_metadata?.filename}"
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="filename">Nama File</Label>
                            <Input
                                id="filename"
                                value={data.filename}
                                onChange={(e) => setData('filename', e.target.value)}
                                placeholder="Masukkan nama file baru"
                                disabled={processing}
                            />
                            {errors.filename && (
                                <p className="text-sm text-red-600">{errors.filename}</p>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}