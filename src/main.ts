import { bootstrapApplication }                   from '@angular/platform-browser';
import { AppComponent }                            from './app/app.component';
import { provideRouter }                           from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi }                       from '@angular/common/http';
import { provideAnimations }                       from '@angular/platform-browser/animations';
import { providePrimeNG }                          from 'primeng/config';
import { CookieService }                           from 'ngx-cookie-service';
import Aura from '@primeng/themes/aura';
import { routes }                                  from './app/app.routes';
import { HTTP_INTERCEPTORS }                       from '@angular/common/http';
import { environment } from './environments/environment';
import { API_BASE_URL } from './app/shared/api/service-proxies';
import { JwtInterceptor } from './app/shared/api/jwt.interceptor';
import { TokenInterceptor } from './app/shared/api/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },

    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    provideAnimations(),
    providePrimeNG({ theme: { preset: Aura } }),
    CookieService
  ]
});