import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent), title: 'Sake Marketing Solutions - Premium Digital Agency' },
  { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent), title: 'About Us - Sake Marketing Solutions' },
  { path: 'mission', loadComponent: () => import('./components/mission/mission.component').then(m => m.MissionComponent), title: 'Our Mission - Sake Marketing Solutions' },
  { path: 'vision', loadComponent: () => import('./components/vision/vision.component').then(m => m.VisionComponent), title: 'Our Vision - Sake Marketing Solutions' },
  { path: 'services', loadComponent: () => import('./components/services/services.component').then(m => m.ServicesComponent), title: 'Services - Sake Marketing Solutions' },
  { path: 'team', loadComponent: () => import('./components/team/team.component').then(m => m.TeamComponent), title: 'Our Team - Sake Marketing Solutions' },
  { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent), title: 'Contact Us - Sake Marketing Solutions' },
  { path: 'admin/login', loadComponent: () => import('./components/admin/login/login.component').then(m => m.LoginComponent), title: 'Admin Login - Sake Marketing Solutions' },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Sake Marketing Solutions',
    children: [
      { path: '', redirectTo: 'services', pathMatch: 'full' },
      { path: 'services', loadComponent: () => import('./components/admin/admin-services/admin-services.component').then(m => m.AdminServicesComponent) },
      { path: 'employees', loadComponent: () => import('./components/admin/admin-employees/admin-employees.component').then(m => m.AdminEmployeesComponent) }
    ]
  },
  { path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent), title: '404 - Page Not Found' }
];
