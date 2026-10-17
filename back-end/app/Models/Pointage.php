<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pointage extends Model
{
    use HasFactory;

    protected $table = 'pointages';

    protected $fillable = [
        'user_id',
        'chantier_id',
        'date_pointage',
        'heure_arrivee',
        'heure_depart',
        'latitude',
        'longitude',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class, 'chantier_id');
    }
}