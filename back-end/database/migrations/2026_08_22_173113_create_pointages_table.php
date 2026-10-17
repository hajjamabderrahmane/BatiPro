<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('pointages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('utilisateurs')->onDelete('cascade');
        $table->foreignId('chantier_id')->constrained('chantiers')->onDelete('cascade');
        $table->date('date_pointage');
        $table->time('heure_arrivee')->nullable();
        $table->time('heure_depart')->nullable();
        $table->float('latitude');
        $table->float('longitude');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
