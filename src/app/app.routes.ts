import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
        import('../account/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () =>
        import('../account/register/register.component').then(
            m => m.RegisterComponent
        ),
    },

    {
        path: 'home',
        loadComponent: () =>
        import('./main/home/home.component').then(m => m.HomeComponent),
        canActivate: [AuthGuard],
    },
    {
        path: 'search',
        loadComponent: () =>
        import('./main/search/search.component').then(m => m.SearchComponent),
        canActivate: [AuthGuard],
    },
    {
        path: 'profile/:id',
        pathMatch: 'full', 
        loadComponent: () =>
        import('./main/profile/profile.component').then(
            m => m.ProfileComponent
        ),
        canActivate: [AuthGuard],
    },

    {
        path: ':id',
        loadComponent: () =>
        import('./shared/components/publication-view/publication-view.component').then(
            m => m.PublicationViewComponent
        ),
        canActivate: [AuthGuard],
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home' },
];