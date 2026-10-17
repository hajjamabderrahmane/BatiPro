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
    Schema::create('affectations', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('utilisateurs')->onDelete('cascade');
        $table->foreignId('chantier_id')->constrained('chantiers')->onDelete('cascade');
        $table->date('date_affectation');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
