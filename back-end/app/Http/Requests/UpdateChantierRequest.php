<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChantierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'sometimes|required|string|max:255',
            'adresse' => 'sometimes|required|string|max:255',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|nullable|date|after_or_equal:date_debut',
            // 'code_qr' => 'sometimes|nullable|string|unique:chantiers,code_qr,' . $this->route('id'),
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
        ];
    }
}