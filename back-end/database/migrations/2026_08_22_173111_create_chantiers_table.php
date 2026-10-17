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
    Schema::create('chantiers', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->string('adresse');
        $table->date('date_debut');
        $table->date('date_fin')->nullable();
        $table->string('code_qr')->unique();
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
        Schema::dropIfExists('chantiers');
    }
};
