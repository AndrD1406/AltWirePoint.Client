// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationResponse } from './service-proxies';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private http: HttpClient,
        private cookies: CookieService
    ) {}

    refresh(): Observable<AuthenticationResponse> {
        const token        = this.cookies.get('jwt');
        const refreshToken = this.cookies.get('refreshToken');
        return this.http.post<AuthenticationResponse>(
            `https://localhost:7019/api/Account/refresh`,
            { token, refreshToken },
            { withCredentials: true }
        );
    }

    storeTokens(resp: AuthenticationResponse, rememberMe: boolean) {
        const expiry = rememberMe
        ? new Date(Date.now() + 7*24*60*60*1000)
        : undefined;
        // set jwt
        this.cookies.set('jwt', resp.token!, expiry, '/', undefined, false, 'Strict');
        // set refreshToken
        this.cookies.set('refreshToken', resp.refreshToken!, expiry, '/', undefined, false, 'Strict');
    }

    getRememberMe(): boolean {
        return localStorage.getItem('rememberMe') === 'true';
    }

    setRememberMe(flag: boolean) {
        localStorage.setItem('rememberMe', flag ? 'true' : 'false');
    }

    getUserIdFromToken(): string | null {
        const token = this.cookies.get('jwt');
        if (!token) return null;

        try {
            const payloadBase64 = token.split('.')[1];
            const payloadJson   = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const payload      = JSON.parse(payloadJson);

            return payload['nameid'] || payload['sub'] || null;
        } catch {
        return null;
        }
    }

    logout(): void {
        // remove JWT + refresh-token cookies
        this.cookies.delete('jwt', '/');
        this.cookies.delete('refreshToken', '/');

        // if you were storing rememberMe in localStorage, clear it too:
        localStorage.removeItem('rememberMe');
    }
}
