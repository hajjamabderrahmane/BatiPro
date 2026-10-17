<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('affectations', function (Blueprint $table) {
            // Supprime l'ancienne contrainte :
            // un même utilisateur pouvait avoir plusieurs chantiers
            $table->dropUnique(['user_id', 'chantier_id']);

            // Un utilisateur ne peut maintenant avoir qu'une seule affectation
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('affectations', function (Blueprint $table) {
            // Supprime la contrainte user_id unique
            $table->dropUnique(['user_id']);

            // Restaure l'ancienne contrainte
            $table->unique(['user_id', 'chantier_id']);
        });
    }
};