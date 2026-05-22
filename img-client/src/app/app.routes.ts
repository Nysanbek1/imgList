import { Routes } from '@angular/router';
import { UserLogin } from './components/user-login/user-login';
import { Dashboard } from './components/dashboard/dashboard';
import { UserCreate } from './components/user-create/user-create';
import { authGuard } from './guards/auth-guard';

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
  
  // 4. Создание пользователя
  {
    path: 'createUser',
    component: UserCreate,
  },
  
  // 5. Если ввели несуществующий адрес (например /asdfasdf), отправляем на dashboard.
  // Это предотвратит бесконечный цикл на странице логина.
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
