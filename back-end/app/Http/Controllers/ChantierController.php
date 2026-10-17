<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Http\Requests\StoreChantierRequest;
use App\Http\Requests\UpdateChantierRequest;
use Illuminate\Support\Str;

class ChantierController extends Controller
{
    // Lister tous les chantiers
    public function index()
    {
        $chantiers = Chantier::all();

        return response()->json([
            'chantiers' => $chantiers
        ]);
    }

    // Afficher un chantier
    public function show($id)
    {
        $chantier = Chantier::find($id);

        if (!$chantier) {
            return response()->json([
                'message' => 'Chantier non trouvé'
            ], 404);
        }

        return response()->json([
            'chantier' => $chantier
        ]);
    }

    // Créer un chantier
    // public function store(StoreChantierRequest $request)
    // {
    //     $data = $request->validated();

    //     $chantier = Chantier::create($data);

    //     return response()->json([
    //         'message' => 'Chantier créé avec succès',
    //         'chantier' => $chantier
    //     ], 201);
    // }
    public function store(StoreChantierRequest $request)
{
    $data = $request->validated();

    $data['code_qr'] = 'QR-' . strtoupper(Str::random(10));

    $chantier = Chantier::create($data);

    return response()->json([
        'message' => 'Chantier créé avec succès',
        'chantier' => $chantier
    ], 201);
}

    // Modifier un chantier
    public function update(UpdateChantierRequest $request, $id)
    {
        $chantier = Chantier::find($id);

        if (!$chantier) {
            return response()->json([
                'message' => 'Chantier non trouvé'
            ], 404);
        }

        $chantier->update($request->validated());

        return response()->json([
            'message' => 'Chantier modifié avec succès',
            'chantier' => $chantier
        ]);
    }

    // Supprimer un chantier
    // public function destroy($id)
    // {
    //     $chantier = Chantier::find($id);

    //     if (!$chantier) {
    //         return response()->json([
    //             'message' => 'Chantier non trouvé'
    //         ], 404);
    //     }

    //     $chantier->delete();

    //     return response()->json([
    //         'message' => 'Chantier supprimé avec succès'
    //     ]);
    // }
    public function destroy($id)
{
    $chantier = Chantier::findOrFail($id);

    if ($chantier->utilisateurs()->exists()) {
    return response()->json([
        'message' => 'Impossible de supprimer ce chantier : des employés y sont encore affectés.'
    ], 422);
}

    $chantier->delete();

    return response()->json([
        'message' => 'Chantier supprimé avec succès'
    ]);
}

    public function utilisateurs($id)
{
    $chantier = Chantier::find($id);

    if (!$chantier) {
        return response()->json(['message' => 'Chantier non trouvé'], 404);
    }

    if (!$this->accesAutorise($chantier)) {
        return response()->json(['message' => 'Accès refusé à ce chantier'], 403);
    }

    return response()->json([
        'chantier' => $chantier->nom,
        'utilisateurs' => $chantier->utilisateurs
    ]);
}

private function accesAutorise(Chantier $chantier): bool
{
    $utilisateur = auth('api')->user();

    if ($utilisateur->role === 'admin') {
        return true;
    }

    if ($utilisateur->role === 'chef_chantier') {
        return $chantier->utilisateurs()->where('user_id', $utilisateur->id)->exists();
    }

    return false;
}

}