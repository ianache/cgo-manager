import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';
import { authGuard } from '@cgomanager/shared-data-access';

export const appRoutes: Route[] = [
  {
    path: 'reporting',
    loadChildren: () => import('reporting/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('dashboard/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tenants',
    canActivate: [authGuard],
    loadChildren: () => import('tenants/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tracking',
    canActivate: [authGuard],
    loadChildren: () => import('tracking/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'config',
    canActivate: [authGuard],
    loadChildren: () => import('config/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
