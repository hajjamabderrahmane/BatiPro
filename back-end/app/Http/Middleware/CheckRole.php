<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $utilisateur = auth('api')->user();

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        if (!in_array($utilisateur->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé : rôle insuffisant'
            ], 403);
        }

        return $next($request);
    }
}