import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizationService } from '../../shared/services/localization.service';
import { AppComponentBase } from '../../shared/app-component-base';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent extends AppComponentBase implements OnInit {
    currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    languages = [
        { code: 'en', label: 'English' },
        { code: 'uk', label: 'Українська' },
    ];

    constructor(loc: LocalizationService) {
        super(loc);
    }

    ngOnInit(): void {}

    switchLanguage(language: string): void {
        this.currentLanguage = language;
        localStorage.setItem('currentLanguage', language);
        this.loc.loadTranslations(language).subscribe(() => {
            // Reload the page to apply new translations everywhere
            window.location.reload();
        });
    }
}
