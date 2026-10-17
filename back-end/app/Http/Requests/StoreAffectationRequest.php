<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAffectationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:utilisateurs,id',
            'chantier_id' => 'required|exists:chantiers,id',
            'date_affectation' => 'required|date',
        ];
    }
}