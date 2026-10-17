<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    use HasFactory;

    protected $table = 'affectations';

    protected $fillable = [
        'user_id',
        'chantier_id',
        'date_affectation',
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