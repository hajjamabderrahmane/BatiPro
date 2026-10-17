<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUtilisateurRequest;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateUtilisateurRequest;

class UtilisateurController extends Controller
{
    // Lister tous les utilisateurs
    public function index()
    {
        $utilisateurs = Utilisateur::all();

        return response()->json([
            'utilisateurs' => $utilisateurs
        ]);
    }

    // Afficher un utilisateur
    public function show($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'utilisateur' => $utilisateur
        ]);
    }

    public function store(StoreUtilisateurRequest $request)
{
    $data = $request->validated();

    $data['mot_de_passe'] = Hash::make($data['mot_de_passe']);

    $utilisateur = Utilisateur::create($data);

    return response()->json([
        'message' => 'Utilisateur créé avec succès',
        'utilisateur' => $utilisateur
    ], 201);
}


    // Modifier un utilisateur
    public function update(UpdateUtilisateurRequest $request, $id)
{
    $utilisateur = Utilisateur::find($id);

    if (!$utilisateur) {
        return response()->json([
            'message' => 'Utilisateur non trouvé'
        ], 404);
    }

    $data = $request->validated();

    $utilisateur->update($data);

    return response()->json([
        'message' => 'Utilisateur modifié avec succès',
        'utilisateur' => $utilisateur
    ], 200);
}

    // Supprimer un utilisateur
    public function destroy($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $utilisateur->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    public function changePassword(ChangePasswordRequest $request, $id)
{
    $utilisateur = Utilisateur::find($id);

    if (!$utilisateur) {
        return response()->json([
            'message' => 'Utilisateur non trouvé'
        ], 404);
    }

    $utilisateur->update([
        'mot_de_passe' => Hash::make($request->mot_de_passe),
    ]);

    return response()->json([
        'message' => 'Mot de passe modifié avec succès'
    ], 200);
}
}