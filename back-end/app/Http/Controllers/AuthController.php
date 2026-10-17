<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // =========================
    // REGISTER
    // =========================
//     public function register(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//     'nom' => 'required|string|max:255',
//     'prenom' => 'required|string|max:255',
//     'email' => 'required|email|unique:utilisateurs,email',
//     'mot_de_passe' => 'required|string|min:8',
// ]);

// if ($validator->fails()) {
//     return response()->json([
//         'errors' => $validator->errors()
//     ], 422);
// }

// $utilisateur = Utilisateur::create([
//     'nom' => $request->nom,
//     'prenom' => $request->prenom,
//     'email' => $request->email,
//     'mot_de_passe' => Hash::make($request->mot_de_passe),
//     'role' => 'employe', // rôle fixé automatiquement, jamais choisi par l'utilisateur
// ]);
//         $token = JWTAuth::fromUser($utilisateur);

//         return response()->json([
//             'message' => 'Utilisateur créé avec succès',
//             'utilisateur' => $utilisateur,
//             'token' => $token,
//         ], 201);
//     }


    // =========================
    // LOGIN
    // =========================
   public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'mot_de_passe' => 'required|string',
    ]);

    $token = JWTAuth::attempt([
        'email' => $credentials['email'],
        'password' => $credentials['mot_de_passe'],
    ]);

    if (!$token) {
        return response()->json([
            'message' => 'Email ou mot de passe incorrect'
        ], 401);
    }

    // Récupère l'utilisateur directement depuis la base, via son email
    $utilisateur = Utilisateur::where('email', $credentials['email'])->first();

    return response()->json([
        'message' => 'Connexion réussie',
        'token' => $token,
        'utilisateur' => $utilisateur,
    ]);
}


    // =========================
    // ME
    // =========================
    public function me()
    {
        $utilisateur = JWTAuth::parseToken()->authenticate();

        return response()->json([
            'utilisateur' => $utilisateur
        ]);
    }


    // =========================
    // LOGOUT
    // =========================
    public function logout()
    {
        JWTAuth::parseToken()->invalidate();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }


    // =========================
    // REFRESH
    // =========================
    public function refresh()
    {
        $token = JWTAuth::parseToken()->refresh();

        return response()->json([
            'token' => $token
        ]);
    }
}