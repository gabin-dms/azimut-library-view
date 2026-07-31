import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Usage: { canActivate: [roleGuard(['LIBRARIAN', 'ADMIN'])] } on a route's data-less config —
 *  call the factory directly in the route definition. */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasAnyRole(...allowedRoles)) {
      return true;
    }
    return router.createUrlTree(['/']);
  };
}
