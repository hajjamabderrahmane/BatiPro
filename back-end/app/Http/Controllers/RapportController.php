<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\Chantier;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class RapportController extends Controller
{
    // Rapport global (Administrateur) - tous chantiers confondus
    public function global(Request $request)
    {
        $dateDebut = $request->input('date_debut', Carbon::now()->startOfMonth()->toDateString());
        $dateFin = $request->input('date_fin', Carbon::now()->endOfMonth()->toDateString());

        $utilisateurs = Utilisateur::where('role', '!=', 'admin')->get();

        $rapport = $utilisateurs->map(function ($utilisateur) use ($dateDebut, $dateFin) {
            return $this->calculerStatistiques($utilisateur, $dateDebut, $dateFin);
        });

        return response()->json([
            'periode' => ['debut' => $dateDebut, 'fin' => $dateFin],
            'rapport' => $rapport
        ]);
    }

    // Rapport d'un chantier précis (Administrateur + Chef de chantier)
    public function parChantier(Request $request, $id)
    {
        $chantier = Chantier::find($id);

        if (!$chantier) {
            return response()->json(['message' => 'Chantier non trouvé'], 404);
        }

        if (!$this->accesAutorise($chantier)) {
            return response()->json(['message' => 'Accès refusé à ce chantier'], 403);
        }

        $dateDebut = $request->input('date_debut', Carbon::now()->startOfMonth()->toDateString());
        $dateFin = $request->input('date_fin', Carbon::now()->endOfMonth()->toDateString());

        $utilisateurs = $chantier->utilisateurs;

        $rapport = $utilisateurs->map(function ($utilisateur) use ($dateDebut, $dateFin, $chantier) {
            return $this->calculerStatistiques($utilisateur, $dateDebut, $dateFin, $chantier->id);
        });

        return response()->json([
            'chantier' => $chantier->nom,
            'periode' => ['debut' => $dateDebut, 'fin' => $dateFin],
            'rapport' => $rapport
        ]);
    }

    // Calcule les statistiques d'un utilisateur sur une période donnée
//     private function calculerStatistiques($utilisateur, $dateDebut, $dateFin, $chantierId = null)
// {
//     $query = Pointage::where('user_id', $utilisateur->id)
//         ->whereBetween('date_pointage', [$dateDebut, $dateFin]);

//     if ($chantierId) {
//         $query->where('chantier_id', $chantierId);
//     }

//     $pointages = $query->get();

//     $joursPresents = $pointages->count();

//     $minutesTotal = $pointages->sum(function ($pointage) {
//         if ($pointage->heure_arrivee && $pointage->heure_depart) {
//             $arrivee = Carbon::parse($pointage->heure_arrivee);
//             $depart = Carbon::parse($pointage->heure_depart);
//             return abs($arrivee->diffInMinutes($depart));
//         }
//         return 0;
//     });

//     $heuresTravaillees = intdiv($minutesTotal, 60);
//     $minutesRestantes = $minutesTotal % 60;

//     $joursOuvres = $this->compterJoursOuvres($dateDebut, $dateFin);
//     $absences = max(0, $joursOuvres - $joursPresents);

//     return [
//         'utilisateur_id' => $utilisateur->id,
//         'nom' => $utilisateur->nom,
//         'prenom' => $utilisateur->prenom,
//         'jours_presents' => $joursPresents,
//         'absences' => $absences,
//         'heures_travaillees' => sprintf('%dh%02d', $heuresTravaillees, $minutesRestantes),
//     ];
// }
private function calculerStatistiques($utilisateur, $dateDebut, $dateFin, $chantierId = null)
{
    // Récupérer l'affectation unique de l'employé
    $affectation = $utilisateur->affectation;

    // Si l'employé n'est affecté à aucun chantier,
    // il ne doit pas avoir d'absence dans le rapport
    if (!$affectation) {
        return [
            'utilisateur_id' => $utilisateur->id,
            'nom' => $utilisateur->nom,
            'prenom' => $utilisateur->prenom,
            'jours_presents' => 0,
            'absences' => 0,
            'heures_travaillees' => '0h00',
        ];
    }

    // Si un chantier précis est demandé,
    // vérifier que l'employé est affecté à ce chantier
    if ($chantierId && $affectation->chantier_id != $chantierId) {
        return [
            'utilisateur_id' => $utilisateur->id,
            'nom' => $utilisateur->nom,
            'prenom' => $utilisateur->prenom,
            'jours_presents' => 0,
            'absences' => 0,
            'heures_travaillees' => '0h00',
        ];
    }

    // Date de début effective du calcul
    $dateDebutCalcul = Carbon::parse($dateDebut);

    // Prendre en compte la date d'affectation
    $dateAffectation = Carbon::parse($affectation->date_affectation);

    if ($dateAffectation->greaterThan($dateDebutCalcul)) {
        $dateDebutCalcul = $dateAffectation;
    }

    // Si l'affectation commence après la fin de la période
    if ($dateDebutCalcul->greaterThan(Carbon::parse($dateFin))) {
        return [
            'utilisateur_id' => $utilisateur->id,
            'nom' => $utilisateur->nom,
            'prenom' => $utilisateur->prenom,
            'jours_presents' => 0,
            'absences' => 0,
            'heures_travaillees' => '0h00',
        ];
    }

    // Récupérer les pointages dans la période effective
    $query = Pointage::where('user_id', $utilisateur->id)
        ->whereBetween('date_pointage', [
            $dateDebutCalcul->toDateString(),
            $dateFin
        ]);

    if ($chantierId) {
        $query->where('chantier_id', $chantierId);
    }

    $pointages = $query->get();

    $joursPresents = $pointages->count();

    // Calcul des heures travaillées
    $minutesTotal = $pointages->sum(function ($pointage) {
        if ($pointage->heure_arrivee && $pointage->heure_depart) {
            $arrivee = Carbon::parse($pointage->heure_arrivee);
            $depart = Carbon::parse($pointage->heure_depart);

            return abs($arrivee->diffInMinutes($depart));
        }

        return 0;
    });

    $heuresTravaillees = intdiv($minutesTotal, 60);
    $minutesRestantes = $minutesTotal % 60;

    // Calcul des jours ouvrés à partir de l'affectation
    $joursOuvres = $this->compterJoursOuvres(
        $dateDebutCalcul->toDateString(),
        $dateFin
    );

    $absences = max(0, $joursOuvres - $joursPresents);

    return [
        'utilisateur_id' => $utilisateur->id,
        'nom' => $utilisateur->nom,
        'prenom' => $utilisateur->prenom,
        'jours_presents' => $joursPresents,
        'absences' => $absences,
        'heures_travaillees' => sprintf(
            '%dh%02d',
            $heuresTravaillees,
            $minutesRestantes
        ),
    ];
}

    // Compte les jours ouvrés (lundi-vendredi) entre 2 dates
    private function compterJoursOuvres($dateDebut, $dateFin)
    {
        $debut = Carbon::parse($dateDebut);
        $fin = Carbon::parse($dateFin);
        $joursOuvres = 0;

        while ($debut->lte($fin)) {
            if ($debut->isWeekday()) {
                $joursOuvres++;
            }
            $debut->addDay();
        }

        return $joursOuvres;
    }

    // Réutilise la même logique de sécurité que ChantierController
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

    public function monRapport(Request $request)
{
    /** @var \App\Models\Utilisateur $utilisateur */
    $utilisateur = auth('api')->user();

    $chantier = $utilisateur->chantiers()->first();

    if (!$chantier) {
        return response()->json([
            'message' => 'Vous n\'êtes affecté à aucun chantier.'
        ], 404);
    }

    return $this->parChantier($request, $chantier->id);
}
}