<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Affectation;
use App\Http\Requests\StoreAffectationRequest;
use Illuminate\Database\QueryException;

class AffectationController extends Controller
{
    
    public function index()
    {
        $affectations = Affectation::with(['utilisateur', 'chantier'])->get();

        return response()->json([
            'affectations' => $affectations
        ]);
    }

    // public function store(StoreAffectationRequest $request)
    // {
    //     $data = $request->validated();

    //     try {
    //         $affectation = Affectation::create($data);
    //     } catch (QueryException $e) {
    //         if ($e->getCode() === '23000') {
    //             return response()->json([
    //                 'message' => 'Cet utilisateur est déjà affecté à ce chantier'
    //             ], 409);
    //         }
    //         throw $e;
    //     }

    //     return response()->json([
    //         'message' => 'Affectation créée avec succès',
    //         'affectation' => $affectation->load(['utilisateur', 'chantier'])
    //     ], 201);
    // }

//     public function store(StoreAffectationRequest $request)
// {
//     $data = $request->validated();

//     $existe = Affectation::where('user_id', $data['user_id'])->exists();

//     if ($existe) {
//         return response()->json([
//             'message' => 'Cet utilisateur est déjà affecté à un chantier.'
//         ], 409);
//     }

//     $affectation = Affectation::create($data);

//     return response()->json([
//         'message' => 'Affectation créée avec succès',
//         'affectation' => $affectation->load(['utilisateur', 'chantier'])
//     ], 201);
// }

public function store(StoreAffectationRequest $request)
{
    $data = $request->validated();

    $existe = Affectation::where('user_id', $data['user_id'])->exists();

    if ($existe) {
        return response()->json([
            'message' => 'Cet utilisateur est déjà affecté à un chantier.'
        ], 409);
    }

    $chantier = Chantier::findOrFail($data['chantier_id']);

    // Vérifier la date de début du chantier
    if ($data['date_affectation'] < $chantier->date_debut) {
        return response()->json([
            'message' => 'La date d’affectation ne peut pas être antérieure à la date de début du chantier.'
        ], 422);
    }

    // Vérifier la date de fin du chantier
    if ($chantier->date_fin && $data['date_affectation'] > $chantier->date_fin) {
        return response()->json([
            'message' => 'La date d’affectation ne peut pas être postérieure à la date de fin du chantier.'
        ], 422);
    }

    $affectation = Affectation::create($data);

    return response()->json([
        'message' => 'Affectation créée avec succès',
        'affectation' => $affectation->load(['utilisateur', 'chantier'])
    ], 201);
}

    public function destroy($id)
    {
        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json(['message' => 'Affectation non trouvée'], 404);
        }

        $affectation->delete();

        return response()->json(['message' => 'Affectation supprimée avec succès']);
    }

    // Récupère le chantier auquel l'utilisateur connecté est affecté
public function monAffectation()
{
    $utilisateur = auth('api')->user();

    $affectation = Affectation::where('user_id', $utilisateur->id)
        ->with('chantier')
        ->first();

    if (!$affectation) {
        return response()->json(['chantier' => null]);
    }

    return response()->json(['chantier' => $affectation->chantier]);
}
}