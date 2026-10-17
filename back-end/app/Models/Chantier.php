<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chantier extends Model
{
    use HasFactory;

    protected $table = 'chantiers';

    protected $fillable = [
        'nom',
        'adresse',
        'date_debut',
        'date_fin',
        'code_qr',
        'latitude',
        'longitude',
    ];

    // Relation N-N avec Utilisateur via la table pivot Affectation
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'affectations', 'chantier_id', 'user_id')
                    ->withPivot('date_affectation')
                    ->withTimestamps();
    }

    // Relation 1-N : un chantier a plusieurs pointages
    public function pointages()
    {
        return $this->hasMany(Pointage::class, 'chantier_id');
    }
    


}