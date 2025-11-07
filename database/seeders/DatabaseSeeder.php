<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
       $adminUser = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => 'password',
            ]
        );

        // Seed roles first so subsequent seeders can assign roles
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
        ]);

        $adminUser->assignRole('superadmin');
    }
}
