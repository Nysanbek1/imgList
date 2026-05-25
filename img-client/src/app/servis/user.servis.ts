import { Injectable } from "@angular/core";
import { jwtDecode } from 'jwt-decode';
import { api } from "./api";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

export interface LoginInfo {
  name: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  _id: string;
  name: string;
}

export interface JwtPayload {
  username: string;
  sub: string;
}

const apiCreate = api + 'users/craeteUser';
const apiLogin = api + 'users/login';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        const token = this.getToken();
        if (token) {
            this.applyTokenClaims(token);
        }
    }

    private applyTokenClaims(token: string) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            this.logout();
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
    }
    getUserId():  string | null {
        return localStorage.getItem('userId');
    }

    createUser(createInfo: LoginInfo): Observable<LoginResponse>{
        return this.http.post<LoginResponse>(apiCreate, createInfo)
    }

    loginUser(loginInfo: LoginInfo): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(apiLogin, loginInfo).pipe(
            tap((response) => {
                this.setToken(response.access_token);
                localStorage.setItem('userId', response._id);
                localStorage.setItem('userName', response.name);
                this.applyTokenClaims(response.access_token);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
}