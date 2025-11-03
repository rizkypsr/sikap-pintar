<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(): Response
    {
        $departments = Department::query()
            ->orderBy('id')
            ->get();

        return Inertia::render('FileManagement/Departments/Index', [
            'departments' => $departments,
        ]);
    }

     /**
     * Display a specific department.
     */
    public function show(Department $department): Response
    {
        return Inertia::render('FileManagement/Departments/Show', [
            'department' => $department,
        ]);
    }
}
