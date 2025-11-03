<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
     /**
     * Display categories for a specific department.
     */
    public function index(Request $request, Department $department)
    {
        // Get all categories without search filtering (search handled in frontend)
        $categories = $department->categories()
            ->with('creator')
            ->latest()
            ->get();

        return Inertia::render('FileManagement/Categories/Index', [
            'department' => $department,
            'categories' => $categories,
        ]);
    }

    /**
     * Display the specified category with its files.
     */
    public function show(Category $category, Department $department)
    {
        $category->load('department');

        return Inertia::render('FileManagement/Categories/Show', [
            'department' => $department,
            'category' => $category->load('department', 'creator'),
        ]);
    }

    /**
     * Get files for a specific category with pagination.
     */
    public function files(Request $request, Category $category)
    {
        $query = $category->files()
            ->with(['currentMetadata', 'creator'])
            ->when($request->search, function ($query, $search) {
                return $query->whereHas('currentMetadata', function ($q) use ($search) {
                    $q->where('filename', 'like', "%{$search}%");
                });
            });

        $files = $query->latest()->paginate(10);

        return response()->json([
            'data' => $files->items(),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ],
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request, Department $department)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ]);

        // Generate unique name if name already exists
        $originalName = $request->name;
        $uniqueName = $originalName;
        $counter = 1;

        while ($department->categories()->where('name', $uniqueName)->exists()) {
            $uniqueName = $originalName . ' ' . '(' . $counter . ')';
            $counter++;
        }

        $category = $department->categories()->create([
            'name' => $uniqueName,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ]);

        $category->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
