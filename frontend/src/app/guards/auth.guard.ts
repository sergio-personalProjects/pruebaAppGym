import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.user) return true;

  return auth.restoreSession().pipe(
    map(user => user ? true : router.createUrlTree(['/login']))
  );
};
