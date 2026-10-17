<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\ChantierController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\RapportController;

// Routes publiques
// Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par JWT
Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// routes administrateur : gestion utilisateurs, chantiers, affectations, rapports
Route::middleware(['auth:api', 'role:admin'])->group(function () {

    Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
    Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);
    Route::put('/utilisateurs/{id}/password',[UtilisateurController::class, 'changePassword']);

    Route::get('/chantiers', [ChantierController::class, 'index']);
    Route::get('/chantiers/{id}', [ChantierController::class, 'show']);
    Route::post('/chantiers', [ChantierController::class, 'store']);
    Route::put('/chantiers/{id}', [ChantierController::class, 'update']);
    Route::delete('/chantiers/{id}', [ChantierController::class, 'destroy']);

    Route::get('/affectations', [AffectationController::class, 'index']);
    Route::post('/affectations', [AffectationController::class, 'store']);
    Route::delete('/affectations/{id}', [AffectationController::class, 'destroy']);

    Route::get('/pointages', [PointageController::class, 'index']);

    Route::get('/rapports', [RapportController::class, 'global']);

    Route::get('/chantiers/{id}/rapports', [RapportController::class, 'parChantier']);

});

// Routes accessibles à l'admin et au chef de chantier
Route::middleware(['auth:api', 'role:admin,chef_chantier'])->group(function () {
    Route::get('/chantiers/{id}/utilisateurs', [ChantierController::class, 'utilisateurs']);
        Route::get('/chantiers/{id}/rapports', [RapportController::class, 'parChantier']);

});

Route::middleware(['auth:api', 'role:chef_chantier'])->group(function () {
    Route::get('/chantiers/{id}/pointages', [PointageController::class, 'parChantier']);
});


// Routes de pointage
Route::middleware(['auth:api', 'role:employe,chef_chantier'])->group(function () {
    Route::post('/pointages', [PointageController::class, 'store']);
    Route::get('/mes-pointages', [PointageController::class, 'monHistorique']);
    Route::get('/mon-affectation', [AffectationController::class, 'monAffectation']);
});
