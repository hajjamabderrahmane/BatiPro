<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a local development administrator.
     */
    public function run(): void
    {
        Utilisateur::updateOrCreate(
            ['email' => 'admin@batipro.local'],
            [
                'nom' => 'Admin',
                'prenom' => 'BatiPro',
                'mot_de_passe' => Hash::make('ChangeMe123!'),
                'role' => 'admin',
            ]
        );
    }
}
