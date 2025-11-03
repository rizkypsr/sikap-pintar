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

        $this->call([
            DepartmentSeeder::class,
            RoleSeeder::class,
        ]);

        $adminUser->assignRole('superadmin');
    }
}
