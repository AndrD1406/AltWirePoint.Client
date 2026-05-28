import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterOutlet }     from '@angular/router';
import { PanelMenuModule }  from 'primeng/panelmenu';
import { MenuModule }  from 'primeng/menu';
import { MenuItem }         from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CreateOrEditPublicationComponent } from './shared/components/create-or-edit-publication/create-or-edit-publication.component';
import { AuthService } from './shared/api/auth.service';
import { AccountServiceProxy, ProfileDto, Publication, PublicationServiceProxy } from './shared/api/service-proxies';
import { LocalizePipe } from "./shared/pipes/localization.pipe";
import { AppComponentBase } from './shared/app-component-base';
import { LocalizationService } from './shared/services/localization.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
    HttpClientModule,
    RouterOutlet,
    PanelMenuModule,
    ButtonModule,
    DialogModule,
    CreateOrEditPublicationComponent,
    PanelMenuModule,
    MenuModule,
    LocalizePipe,
    CommonModule
],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent extends AppComponentBase implements OnInit, OnDestroy {

    sideItems: MenuItem[]     = [];
    userMenuItems: MenuItem[] = [];
    userName = '';
    userProfilePicture?: string;
    displayPostModal = false;
    isMobile = false;

    private mobileQuery!: MediaQueryList;
    private mobileListener!: (e: MediaQueryListEvent) => void;

    constructor(
        private authService: AuthService,
        private accountService: AccountServiceProxy,
        private router: Router,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit(): void {
        // Set up mobile breakpoint listener
        this.mobileQuery = window.matchMedia('(max-width: 768px)');
        this.isMobile = this.mobileQuery.matches;
        this.mobileListener = (e: MediaQueryListEvent | MediaQueryList) => {
            this.isMobile = e.matches;
            this.buildMenus();
        };
        
        if (this.mobileQuery.addEventListener) {
            this.mobileQuery.addEventListener('change', this.mobileListener as EventListener);
        } else {
            this.mobileQuery.addListener(this.mobileListener);
        }

        const myId = this.authService.getUserIdFromToken();
        const currentLanguage = localStorage.getItem('currentLanguage') || 'en';

        this.loc.loadTranslations(currentLanguage)
            .subscribe(() => this.buildMenus());

        if (myId) {
            this.accountService.getUserById(myId)
                .subscribe((profile: ProfileDto) => {
                    this.userName = profile.name || '';
                    this.userProfilePicture = profile.profilePictureUrl;
                });
        }
    }

    ngOnDestroy(): void {
        if (this.mobileQuery) {
            if (this.mobileQuery.removeEventListener) {
                this.mobileQuery.removeEventListener('change', this.mobileListener as EventListener);
            } else {
                this.mobileQuery.removeListener(this.mobileListener);
            }
        }
    }

    private buildMenus(): void {
        const myId = this.authService.getUserIdFromToken();

        if (this.isMobile) {
            this.sideItems = [
                { icon: 'pi pi-home',   routerLink: ['/home'],     tooltip: this.t('Main')     },
                { icon: 'pi pi-search', routerLink: ['/search'],   tooltip: this.t('Search')   },
                { icon: 'pi pi-user',   routerLink: ['/profile', myId], tooltip: this.t('Profile') },
                { icon: 'pi pi-cog',    routerLink: ['/settings'], tooltip: this.t('Settings') },
            ];
        } else {
            this.sideItems = [
                { label: this.t('Main'),     icon: 'pi pi-home',   routerLink: ['/home']     },
                { label: this.t('Search'),   icon: 'pi pi-search', routerLink: ['/search']   },
                { label: this.t('Profile'),  icon: 'pi pi-user',   routerLink: ['/profile', myId] },
                { label: this.t('Settings'), icon: 'pi pi-cog',    routerLink: ['/settings'] },
            ];
        }

        this.userMenuItems = [
            {
                label: this.t('Logout'),
                icon: 'pi pi-sign-out',
                command: () => this.onLogout()
            }
        ];
    }

    openPostModal(): void {
        this.displayPostModal = true;
    }

    onPostSaved(pub: Publication): void {
        this.displayPostModal = false;
        // … additional handling if needed …
    }

    override getLogoSrc(logo?: string): string {
        if (!logo) return '/assets/default-logo.png';
        if (logo.startsWith('data:') || logo.startsWith('http')) return logo;
        return `data:image/png;base64,${logo}`;
    }

    private onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}