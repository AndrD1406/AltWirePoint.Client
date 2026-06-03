import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from, EMPTY } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private cookies: CookieService,
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const token = this.cookies.get('jwt');
        let authReq = req;
        if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
        }

        return next.handle(authReq).pipe(
        catchError(err => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
            return this.authService.refresh().pipe(
                switchMap(resp => {
                const rememberMe = this.authService.getRememberMe();
                this.authService.storeTokens(resp, rememberMe);

                const newReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${resp.token}` }
                });
                return next.handle(newReq);
                }),
                catchError(() => {
                this.router.navigate(['/login']);
                return throwError(() => err);
                })
            );
            }
            if (err instanceof HttpErrorResponse && err.status === 403) {
                if (err.error instanceof Blob) {
                    return from(err.error.text()).pipe(
                        switchMap(text => {
                            let isBanned = false;
                            try {
                                const parsed = JSON.parse(text);
                                if (parsed.error === "This account has been banned." || parsed.detail === "This account has been banned.") {
                                    isBanned = true;
                                }
                            } catch (e) {}

                            if (isBanned) {
                                const userId = this.authService.getUserIdFromToken();
                                this.authService.logout();
                                this.router.navigate(['/banned'], { queryParams: { userId } });
                                return EMPTY;
                            }
                            return throwError(() => err);
                        })
                    );
                } else if (err.error?.error === "This account has been banned." || err.error?.detail === "This account has been banned.") {
                    const userId = this.authService.getUserIdFromToken();
                    this.authService.logout();
                    this.router.navigate(['/banned'], { queryParams: { userId } });
                    return EMPTY;
                }
            }
            return throwError(() => err);
        })
        );
    }
}