import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'catalog', loadComponent: () => import('./features/catalog/catalog-list').then((m) => m.CatalogList) },
      { path: 'my-loans', loadComponent: () => import('./features/my-loans/my-loans').then((m) => m.MyLoans) },
      { path: 'resources', loadComponent: () => import('./features/resources/resources').then((m) => m.Resources) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile').then((m) => m.Profile) },
      {
        path: 'desk',
        canActivate: [roleGuard(['LIBRARIAN', 'ADMIN'])],
        loadComponent: () => import('./features/desk/desk').then((m) => m.Desk)
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/admin/users/user-admin').then((m) => m.UserAdmin)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
