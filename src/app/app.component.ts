import { Component, OnInit }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }      from '@angular/forms';
import { Router, RouterOutlet }     from '@angular/router';
import { PanelMenuModule }  from 'primeng/panelmenu';
import { MenuModule }  from 'primeng/menu';
import { MenuItem }         from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CreateOrEditPublicationComponent } from './shared/components/create-or-edit-publication/create-or-edit-publication.component';
import { AuthService } from './shared/api/auth.service';
import { ProfileDto, PublicationDto, PublicationServiceProxy } from './shared/api/service-proxies';
import { LocalizePipe } from "./shared/pipes/localization.pipe";
import { AppComponentBase } from './shared/app-component-base';
import { LocalizationService } from './shared/services/localization.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
    HttpClientModule,
    FormsModule,
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
export class AppComponent extends AppComponentBase implements OnInit {
    currentLang = 'en';

    languages = [
        { code: 'en', label: 'English' },
        { code: 'ua', label: 'Українська' },
    ];

    sideItems: MenuItem[]     = [];
    userMenuItems: MenuItem[] = [];
    userName = '';
    userLogo?: string;
    displayPostModal = false;

    constructor(
        private authService: AuthService,
        private publicationService: PublicationServiceProxy,
        private router: Router,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit(): void {
        const myId = this.authService.getUserIdFromToken();

        this.buildMenus();

        this.loc.loadTranslations(this.currentLang)
        .subscribe(() => this.buildMenus());

        if (myId) {
        this.publicationService.getUserById(myId)
            .subscribe((profile: ProfileDto) => {
            this.userName = profile.name || '';
            this.userLogo = profile.logo;
            });
        }
    }

    switchLanguage(lang: string): void {
        this.currentLang = lang;
        this.loc.loadTranslations(lang).subscribe(() => this.buildMenus());
    }

    private buildMenus(): void {
        const myId = this.authService.getUserIdFromToken();

        this.sideItems = [
        { label: this.t('Main'),    icon: 'pi pi-home',   routerLink: ['/home'] },
        { label: this.t('Search'),  icon: 'pi pi-search', routerLink: ['/search'] },
        { label: this.t('Profile'), icon: 'pi pi-user',   routerLink: ['/profile', myId] },
        {
            label: this.t('More'),
            items: [
            { label: this.t('Settings'), icon: 'pi pi-cog',  routerLink: ['/settings'] },
            { label: this.t('Help'),     icon: 'pi pi-info', routerLink: ['/help']     }
            ]
        }
        ];

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

    onPostSaved(pub: PublicationDto): void {
        this.displayPostModal = false;
        // … anything else …
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