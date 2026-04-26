import { Route } from '@angular/router';
import { authGuard } from '@cgomanager/shared-data-access';
import { LoginErrorComponent } from './auth/login-error';

export const appRoutes: Route[] = [
  {
    path: 'login-error',
    component: LoginErrorComponent,
  },
  {
    path: 'security',
    loadChildren: () => import('security/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'protocols',
    loadChildren: () => import('protocols/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'reporting',
    data: { breadcrumb: 'Reporting' },
    loadChildren: () => import('reporting/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [authGuard],
    loadChildren: () => import('dashboard/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tenants',
    data: { breadcrumb: 'Tenants' },
    canActivate: [authGuard],
    loadChildren: () => import('tenants/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'tracking',
    data: { breadcrumb: 'Tracking' },
    canActivate: [authGuard],
    loadChildren: () => import('tracking/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'config',
    data: { breadcrumb: 'Configuration' },
    canActivate: [authGuard],
    loadChildren: () => import('config/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
