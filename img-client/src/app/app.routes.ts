import { Routes } from '@angular/router';
import { UserLogin } from './components/user-login/user-login';
import { Dashboard } from './components/dashboard/dashboard';
import { UserCreate } from './components/user-create/user-create';
import { authGuard } from './guards/auth-guard';
import { Posts } from './components/posts/posts';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: UserLogin
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  {
    path: 'createUser',
    component: UserCreate,
  },

  {
    path: 'posts',
    component: Posts,
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
