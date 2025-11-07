<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'RAFIKA DARSIH, SE,MM',
                'username' => '198102272009022002',
            ],
            [
                'name' => 'MARTINAH ASNASARI, SE',
                'username' => '198905242011012001',
            ],
            [
                'name' => 'MUHAMMAD RAFI, A.Md',
                'username' => '198904082019031006',
            ],
            [
                'name' => 'HANDIKA, A.Md.S.I',
                'username' => '199906252025041001',
            ],
            [
                'name' => 'LINAWATI',
                'username' => '198207052009012006',
            ],
            [
                'name' => 'YETTY YUNIARTI, S.IP',
                'username' => '199206032020122007',
            ],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['username' => $data['username']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    // Default password set to username; User model hashes automatically
                    'password' => $data['username'],
                ]
            );

            // Assign default role 'user' to all seeded users
            $user->assignRole('user');
        }

        $this->command->info('User seeding completed: seeded 6 users with role "user".');
    }
}