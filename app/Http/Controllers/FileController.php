<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Department;
use App\Models\File;
use App\Models\FileMetadata;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileController extends Controller
{
    public function index(Request $request, Department $department, Category $category)
    {
        // Load the department relationship for the category
        $category->load('department');
        
        $files = File::with(['category', 'currentMetadata', 'creator'])
            ->where('category_id', $category->id)
            ->latest()
            ->get();

        return Inertia::render('FileManagement/Files/Index', [
            'category' => $category,
            'files' => $files,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('File upload started', [
            'user_id' => Auth::id(),
            'category_id' => $request->category_id,
            'files_count' => count($request->file('files', [])),
            'request_data' => $request->except(['files']),
        ]);

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:20480', // 20MB in KB
            'category_id' => 'required|exists:categories,id',
        ]);

        try {
            DB::beginTransaction();
            Log::info('Database transaction started for file upload');

            $uploadedFiles = [];
            $errors = [];
            $skippedFiles = [];

            foreach ($request->file('files') as $index => $uploadedFile) {
                Log::info("Processing file {$index}", [
                    'original_name' => $uploadedFile->getClientOriginalName(),
                    'size' => $uploadedFile->getSize(),
                    'mime_type' => $uploadedFile->getMimeType(),
                ]);

                $originalName = $uploadedFile->getClientOriginalName();
                $mimeType = $uploadedFile->getMimeType();
                $size = $uploadedFile->getSize();

                try {
                    // Calculate hash based on filename + file content (as per correct algorithm)
                    $fileContent = file_get_contents($uploadedFile->getRealPath());
                    $hash = hash('sha256', $originalName.$fileContent);

                    Log::info('File hash calculated', [
                        'filename' => $originalName,
                        'hash' => $hash,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to calculate hash for file', [
                        'filename' => $originalName,
                        'error' => $e->getMessage(),
                    ]);
                    $errors[] = [
                        'filename' => $originalName,
                        'error' => 'Gagal menghitung hash file: '.$e->getMessage(),
                    ];

                    continue;
                }

                $file = null;
                $storagePath = null;
                $finalFileName = $originalName;
                $finalHash = $hash;

                // First, try to create file record to check for hash collision
                try {
                    $file = File::create([
                        'category_id' => $request->category_id,
                        'hash' => $finalHash,
                        'created_by' => Auth::id(),
                        'updated_by' => Auth::id(),
                    ]);

                    // No collision, store file with original name
                    $storagePath = $uploadedFile->storeAs('categories/'.$request->category_id.'/files', $finalFileName, 'public');

                    Log::info('File uploaded successfully', [
                        'filename' => $originalName,
                        'hash' => $finalHash,
                        'file_id' => $file->id,
                        'storage_path' => $storagePath,
                    ]);

                } catch (QueryException $e) {
                    // Handle duplicate hash constraint violation (following correct algorithm)
                    if ($e->getCode() == 23000) {
                        Log::info('Duplicate hash detected, creating new file with random suffix', [
                            'original_filename' => $originalName,
                            'original_hash' => $hash,
                        ]);

                        // Extract filename and extension
                        $pathInfo = pathinfo($originalName);
                        $baseName = $pathInfo['filename'];
                        $extension = isset($pathInfo['extension']) ? '.'.$pathInfo['extension'] : '';

                        // Generate random suffix (4 characters)
                        $randomSuffix = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4);
                        $finalFileName = $baseName.' ('.$randomSuffix.')'.$extension;

                        // Rehash with new filename + file content (as per correct algorithm)
                        $finalHash = hash('sha256', $finalFileName.$fileContent);

                        // Create file record with new hash
                        $file = File::create([
                            'category_id' => $request->category_id,
                            'hash' => $finalHash,
                            'created_by' => Auth::id(),
                            'updated_by' => Auth::id(),
                        ]);

                        // Store file with new name
                        $storagePath = $uploadedFile->storeAs('categories/'.$request->category_id.'/files', $finalFileName, 'public');

                        Log::info('Duplicate handled successfully', [
                            'original_filename' => $pathInfo['basename'],
                            'new_filename' => $finalFileName,
                            'original_hash' => $hash,
                            'new_hash' => $finalHash,
                            'file_id' => $file->id,
                        ]);
                    } else {
                        throw $e;
                    }
                } catch (\Exception $e) {
                    Log::error('File upload failed', [
                        'filename' => $originalName,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);

                    $errors[] = [
                        'filename' => $uploadedFile->getClientOriginalName(),
                        'error' => $e->getMessage(),
                    ];

                    // Clean up uploaded file if exists
                    if (isset($storagePath) && Storage::disk('public')->exists($storagePath)) {
                        Log::info('Cleaning up failed upload', [
                            'storage_path' => $storagePath,
                        ]);
                        Storage::disk('public')->delete($storagePath);
                    }

                    continue;
                }

                // Create file metadata (only if file was created successfully)
                if ($file) {
                    try {
                        $metadata = FileMetadata::create([
                            'file_id' => $file->id,
                            'filename' => $finalFileName,
                            'storage_path' => $storagePath,
                            'mime_type' => $mimeType,
                            'size' => $size,
                            'source_action' => 'upload',
                            'created_by' => Auth::id(),
                        ]);

                        // Update file with current metadata
                        $file->update([
                            'current_metadata_id' => $metadata->id,
                        ]);

                        $uploadedFiles[] = $file->load(['category', 'currentMetadata', 'creator']);
                        Log::info('File upload completed successfully', [
                            'file_id' => $file->id,
                            'original_name' => $originalName,
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to create file metadata', [
                            'file_id' => $file->id,
                            'error' => $e->getMessage(),
                        ]);
                        $errors[] = [
                            'filename' => $originalName,
                            'error' => 'Gagal membuat metadata file: '.$e->getMessage(),
                        ];
                    }
                }
            }

            DB::commit();
            Log::info('Database transaction committed', [
                'uploaded_count' => count($uploadedFiles),
                'error_count' => count($errors),
            ]);

            $message = count($uploadedFiles).' file berhasil diupload.';

            if (! empty($errors)) {
                $message .= ' '.count($errors).' file gagal diupload.';
            }

            Log::info('File upload process completed', [
                'message' => $message,
                'uploaded_files' => array_map(fn ($file) => ['id' => $file->id, 'name' => $file->currentMetadata->filename], $uploadedFiles),
                'error_files' => array_map(fn ($error) => $error['filename'], $errors),
            ]);

            return redirect()->back()->with('success', $message)->with('uploaded_files', $uploadedFiles);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('File upload transaction failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Upload gagal: '.$e->getMessage());
        }
    }

    public function update(Request $request, File $file)
    {
        $request->validate([
            'filename' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            if ($file->currentMetadata) {
                // Update the filename in current metadata
                $file->currentMetadata->update([
                    'filename' => $request->filename,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Nama file berhasil diubah.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengubah nama file: '.$e->getMessage());
        }
    }

    public function download(File $file)
    {
        if (! $file->currentMetadata) {
            abort(404, 'File metadata not found');
        }

        $storagePath = $file->currentMetadata->storage_path;

        if (! Storage::disk('public')->exists($storagePath)) {
            abort(404, 'File not found');
        }

        return response()->download(
            Storage::disk('public')->path($storagePath),
            $file->currentMetadata->filename
        );
    }

    public function destroy(File $file)
    {
        try {
            DB::beginTransaction();

            // Delete physical file
            if ($file->currentMetadata && Storage::disk('public')->exists($file->currentMetadata->storage_path)) {
                Storage::disk('public')->delete($file->currentMetadata->storage_path);
            }

            // Delete file record (will cascade delete metadata)
            $file->delete();

            DB::commit();

            return redirect()->back()->with('success', 'File berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus file: '.$e->getMessage());
        }
    }
}
