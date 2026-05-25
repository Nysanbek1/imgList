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

  // 2. Страница логина (вход свободный)
  {
    path: 'login',
    component: UserLogin
  },

  // 3. Защищенный дашборд
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
<<<<<<< HEAD
  
=======

  {
    path: 'posts',
    component: Posts,
  },

  // 4. Создание пользователя
>>>>>>> 1c6f73e10c4e1fc10f752a13478c074371fb6a8b
  {
    path: 'createUser',
    component: UserCreate,
  },
<<<<<<< HEAD
  
  { 
    path: '**', 
    redirectTo: 'dashboard' 
=======

  // 5. Если ввели несуществующий адрес (например /asdfasdf), отправляем на dashboard.
  // Это предотвратит бесконечный цикл на странице логина.
  {
    path: '**',
    redirectTo: 'dashboard'
>>>>>>> 1c6f73e10c4e1fc10f752a13478c074371fb6a8b
  }
];
