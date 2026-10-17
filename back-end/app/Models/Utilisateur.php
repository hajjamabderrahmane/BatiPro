<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Utilisateur extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'role',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    // Indique à Laravel quel champ contient le mot de passe
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    // Méthode obligatoire pour JWT : identifiant unique dans le token
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Méthode obligatoire pour JWT : infos supplémentaires dans le token
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }

    // Relation N-N avec Chantier via la table pivot Affectation
    // public function chantiers()
    // {
    //     return $this->belongsToMany(Chantier::class, 'affectations', 'user_id', 'chantier_id')
    //                 ->withPivot('date_affectation')
    //                 ->withTimestamps();
    // }

    // Un utilisateur possède une seule affectation
public function affectation()
{
    return $this->hasOne(Affectation::class, 'user_id');
}

    // Relation 1-N : un utilisateur a plusieurs pointages
    public function pointages()
    {
        return $this->hasMany(Pointage::class, 'user_id');
    }

    
}