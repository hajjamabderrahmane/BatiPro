<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'sometimes|required|string|max:255',

            'prenom' => 'sometimes|required|string|max:255',

            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('utilisateurs', 'email')->ignore($this->id),
            ],

            'role' => [
                'sometimes',
                'required',
                'in:admin,employe,chef_chantier',
            ],
        ];
    }
}