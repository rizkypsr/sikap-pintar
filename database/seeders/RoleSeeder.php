<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $roles = [
            [
                'name' => 'user',
                'guard_name' => 'web',
            ],
            [
                'name' => 'department_admin',
                'guard_name' => 'web',
            ],
            [
                'name' => 'superadmin',
                'guard_name' => 'web',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name'], 'guard_name' => $role['guard_name']],
                $role
            );
        }

        $this->command->info('Roles seeded successfully.');
    }
}
