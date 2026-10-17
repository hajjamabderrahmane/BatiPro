<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\Chantier;
use App\Http\Requests\StorePointageRequest;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class PointageController extends Controller
{
    // Effectuer un pointage (arrivée ou départ, selon l'état du jour)
    public function store(StorePointageRequest $request)
    {
        // 1. Récupère l'utilisateur connecté (via le token JWT déjà vérifié par le middleware auth:api)
        $utilisateur = auth('api')->user();

        // 2. Retrouve le chantier correspondant au QR Code scanné
        //    (l'existence du code_qr est déjà garantie par StorePointageRequest via exists:chantiers,code_qr)
        $chantier = Chantier::where('code_qr', $request->code_qr)->first();

        // 3. Sécurité métier : l'employé doit être affecté à CE chantier
        //    pour avoir le droit d'y pointer (pas juste être physiquement présent)
        // 
        $estAffecte = \App\Models\Affectation::where('user_id', $utilisateur->id)
    ->where('chantier_id', $chantier->id)
    ->exists();

if (!$estAffecte) {
    return response()->json([
        'message' => 'Vous n\'êtes pas affecté à ce chantier.'
    ], 403);
}

        // 4. Calcule la distance réelle (en mètres) entre la position GPS
        //    de l'employé au moment du scan et la position du chantier
        $distance = $this->calculateDistance(
            $chantier->latitude,
            $chantier->longitude,
            $request->latitude,
            $request->longitude
        );

        // 5. Rejette le pointage si l'employé est physiquement trop loin
        //    du chantier (rayon de tolérance : 100 mètres)
        if ($distance > 100) {
            return response()->json([
                'message' => 'Vous êtes trop loin du chantier',
                'distance' => round($distance, 2)
            ], 403);
        }

        // 6. Cherche si un pointage existe déjà aujourd'hui pour cet employé
        //    sur ce chantier précis (logique "une ligne par jour")
        $pointage = Pointage::where('user_id', $utilisateur->id)
            ->where('chantier_id', $chantier->id)
            ->whereDate('date_pointage', Carbon::today())
            ->first();

        // 7. Aucun pointage aujourd'hui → c'est le premier scan de la journée
        //    → on enregistre l'ARRIVÉE
        if (!$pointage) {
            $pointage = Pointage::create([
                'user_id' => $utilisateur->id,
                'chantier_id' => $chantier->id,
                'date_pointage' => Carbon::today(),
                'heure_arrivee' => Carbon::now()->format('H:i:s'),
                'heure_depart' => null,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            return response()->json([
                'message' => 'Arrivée enregistrée avec succès',
                'pointage' => $pointage
            ], 201);
        }

        // 8. Un pointage existe déjà, mais le départ n'est pas encore enregistré
        //    → c'est le 2e scan de la journée → on enregistre le DÉPART
        if ($pointage->heure_depart === null) {
            $pointage->update([
                'heure_depart' => Carbon::now()->format('H:i:s'),
            ]);

            return response()->json([
                'message' => 'Départ enregistré avec succès',
                'pointage' => $pointage
            ], 200);
        }

        // 9. Arrivée ET départ déjà enregistrés → la journée est déjà complète
        //    → on refuse un 3e scan (évite d'écraser des données valides)
        return response()->json([
            'message' => 'Le pointage de cette journée est déjà terminé'
        ], 409);
    }

    // Calcule la distance en mètres entre 2 points GPS (formule de Haversine)
    // Utilisée pour vérifier que l'employé est physiquement proche du chantier
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Rayon moyen de la Terre, en mètres

        // Conversion des latitudes en radians (nécessaire pour les fonctions trigonométriques)
        $lat1 = deg2rad($lat1);
        $lat2 = deg2rad($lat2);

        // Différences de latitude et longitude, converties en radians
        $deltaLat = $lat2 - $lat1;
        $deltaLon = deg2rad($lon2 - $lon1);

        // Formule de Haversine : calcule la distance angulaire entre 2 points sur une sphère
        $a = sin($deltaLat / 2) ** 2
            + cos($lat1) * cos($lat2) * sin($deltaLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        // Convertit la distance angulaire en distance réelle (mètres)
        return $earthRadius * $c;
    }
    
    public function monHistorique(Request $request)
    {
        $utilisateur = auth('api')->user();

        $query = Pointage::where('user_id', $utilisateur->id)
            ->with('chantier');

        // Filtre optionnel par chantier
        if ($request->has('chantier_id')) {
            $query->where('chantier_id', $request->chantier_id);
        }

        $pointages = $query->orderBy('date_pointage', 'desc')->get();

        return response()->json([
            'pointages' => $pointages
        ]);
    }

    // Consulter tous les pointages (admin uniquement)
public function index(Request $request)
{
    $query = Pointage::with(['utilisateur:id,nom,prenom', 'chantier:id,nom']);

    if ($request->filled('chantier_id')) {
        $query->where('chantier_id', $request->chantier_id);
    }

    if ($request->filled('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    if ($request->filled('date_debut')) {
        $query->whereDate('date_pointage', '>=', $request->date_debut);
    }

    if ($request->filled('date_fin')) {
        $query->whereDate('date_pointage', '<=', $request->date_fin);
    }

    $pointages = $query->orderBy('date_pointage', 'desc')->get();

    return response()->json([
        'pointages' => $pointages
    ]);
}

public function parChantier($id)
{
    $utilisateur = auth('api')->user();

    if ($utilisateur->role === 'chef_chantier') {
        $affectation = \App\Models\Affectation::where('user_id', $utilisateur->id)
            ->where('chantier_id', $id)
            ->first();

        if (!$affectation) {
            return response()->json([
                'message' => 'Vous n\'êtes pas affecté à ce chantier.'
            ], 403);
        }
    }

    $pointages = \App\Models\Pointage::with(['utilisateur', 'chantier'])
        ->where('chantier_id', $id)
        ->orderByDesc('date_pointage')
        ->orderByDesc('heure_arrivee')
        ->get();

    return response()->json([
        'pointages' => $pointages
    ]);
}


}
    