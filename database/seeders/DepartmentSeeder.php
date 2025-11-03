<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user as the creator (assuming there's at least one user)
        $creator = User::first();
        
        if (!$creator) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        $departments = [
            [
                'name' => 'Umum dan Aparatur',
                'description' => '',
                'created_by' => $creator->id,
            ],
            [
                'name' => 'Perencanaan dan Keuangan',
                'description' => '',
                'created_by' => $creator->id,
            ],
            [
                'name' => 'PTSP',
                'description' => 'Pelayanan Terpadu Satu Pintu',
                'created_by' => $creator->id,
            ],
            [
                'name' => 'Penanaman Modal',
                'description' => '',
                'created_by' => $creator->id,
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']],
                $department
            );
        }

        $this->command->info('Departments seeded successfully.');
    }
}
