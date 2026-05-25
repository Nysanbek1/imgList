import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Достаем токен из localStorage
  const token = localStorage.getItem('token');

  // Если токен есть, клонируем запрос и добавляем заголовок
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Передаем измененный запрос дальше по цепочке
    return next(clonedReq);
  }

  // Если токена нет, отправляем запрос как есть (например, для логина)
  return next(req);
};
