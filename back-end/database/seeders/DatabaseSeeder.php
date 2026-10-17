<?php

namespace Database\Seeders;

use App\Models\Affectation;
use App\Models\Chantier;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Crée des comptes de démonstration pour le développement local.
     * Ne crée aucune donnée de démonstration en production.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Seeders de démonstration ignorés en production.');
            return;
        }

        $password = Hash::make('BatiPro@123');

        Utilisateur::updateOrCreate(
            ['email' => 'admin@batipro.test'],
            [
                'nom' => 'Admin',
                'prenom' => 'BatiPro',
                'mot_de_passe' => $password,
                'role' => 'admin',
            ]
        );

        $chef = Utilisateur::updateOrCreate(
            ['email' => 'chef@batipro.test'],
            [
                'nom' => 'Chef',
                'prenom' => 'Demo',
                'mot_de_passe' => $password,
                'role' => 'chef_chantier',
            ]
        );

        $employe = Utilisateur::updateOrCreate(
            ['email' => 'employe@batipro.test'],
            [
                'nom' => 'Employe',
                'prenom' => 'Demo',
                'mot_de_passe' => $password,
                'role' => 'employe',
            ]
        );

        $chantier = Chantier::updateOrCreate(
            ['code_qr' => 'BATIPRO-DEMO-CHANTIER-001'],
            [
                'nom' => 'Chantier de démonstration',
                'adresse' => 'Casablanca, Maroc',
                'date_debut' => now()->toDateString(),
                'date_fin' => null,
                'latitude' => 33.5731,
                'longitude' => -7.5898,
            ]
        );

        // La règle métier impose une seule affectation par utilisateur.
        Affectation::updateOrCreate(
            ['user_id' => $chef->id],
            [
                'chantier_id' => $chantier->id,
                'date_affectation' => now()->toDateString(),
            ]
        );

        Affectation::updateOrCreate(
            ['user_id' => $employe->id],
            [
                'chantier_id' => $chantier->id,
                'date_affectation' => now()->toDateString(),
            ]
        );

        $this->command?->info('Comptes de démonstration BatiPro créés ou mis à jour.');
    }
}