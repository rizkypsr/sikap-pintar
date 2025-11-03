<?php

namespace App\Http\Middleware;

use App\Models\Department;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareDepartmentsData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Share departments data with all Inertia responses
        Inertia::share([
            'departments' => function () {
                return Department::select('id', 'name')->orderBy('id', 'asc')->get();
            }
        ]);

        return $next($request);
    }
}
