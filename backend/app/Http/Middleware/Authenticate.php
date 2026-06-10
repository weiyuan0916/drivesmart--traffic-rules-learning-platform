<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as BaseAuthenticate;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

class Authenticate extends BaseAuthenticate
{
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('api/*')) {
            return null;
        }
        return parent::redirectTo($request);
    }

    protected function unauthenticated($request, array $guards): void
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            throw new AuthenticationException(
                'Unauthenticated.',
                $guards,
                'Bearer',
            );
        }
        parent::unauthenticated($request, $guards);
    }
}
