<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // File Management Routes
    Route::prefix('file-management')->name('file-management.')->group(function () {
        // Departments
        Route::resource('departments', DepartmentController::class)
            ->only(['index', 'show']);

        // Categories (nested in departments)
        Route::resource('departments.categories', CategoryController::class)
            ->only(['index', 'show', 'store', 'update', 'destroy']);

        // Files (nested in categories)
        Route::resource('departments.categories.files', FileController::class)
            ->only(['index', 'show']);
    });

    // File Routess
    Route::prefix('files')->name('files.')->group(function () {
        Route::get('/', [FileController::class, 'index'])
            ->name('index');

        Route::post('/', [FileController::class, 'store'])
            ->name('store');

        Route::get('{file}/download', [FileController::class, 'download'])
            ->name('download');

        Route::put('{file}', [FileController::class, 'update'])
            ->name('update');

        Route::delete('{file}', [FileController::class, 'destroy'])
            ->name('destroy');
    });
});

require __DIR__.'/settings.php';
