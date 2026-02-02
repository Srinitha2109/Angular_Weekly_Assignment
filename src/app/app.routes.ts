import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'ADMIN' },
        children: [
            { path: 'trainers', loadComponent: () => import('./features/admin/trainers/trainers.component').then(m => m.AdminTrainersComponent) },
            { path: 'enrollments', loadComponent: () => import('./features/admin/enrollments/enrollments.component').then(m => m.AdminEnrollmentsComponent) },
            { path: 'finance', loadComponent: () => import('./features/admin/finance/finance.component').then(m => m.AdminFinanceComponent) },
            { path: 'requests', loadComponent: () => import('./features/admin/requests/requests.component').then(m => m.AdminRequestsComponent) },
        ]
    },
    {
        path: 'trainer',
        loadComponent: () => import('./features/trainer/dashboard/dashboard.component').then(m => m.TrainerDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'TRAINER' },
        children: [
            { path: 'assignments', loadComponent: () => import('./features/trainer/assignments/assignments.component').then(m => m.TrainerAssignmentsComponent) },
            { path: 'invoices', loadComponent: () => import('./features/trainer/assignments/assignments.component').then(m => m.TrainerAssignmentsComponent) },
        ]
    },
    {
        path: 'client',
        loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'CLIENT' },
        children: [
            { path: 'requests', loadComponent: () => import('./features/client/requests/requests.component').then(m => m.ClientRequestsComponent) },
            { path: 'invoices', loadComponent: () => import('./features/client/invoices/invoices.component').then(m => m.ClientInvoicesComponent) },
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
