import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ApiService } from './api';
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  
  return api.checkAuth().pipe(
    map(response => response.authenticated),
    tap(authenticated => {
      if (!authenticated) {
        api.login();
      }
    })
  );
};
