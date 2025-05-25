import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LocalizationService {
    private translations: { [key: string]: string } = {};

    loadTranslations(lang: string): Observable<void> {
        return this.http.get(`assets/i18n/${lang}.xml`, { responseType: 'text' }).pipe(
            map(xmlText => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
                const nodes = Array.from(xmlDoc.getElementsByTagName('string'));
                this.translations = {};
                nodes.forEach(n => {
                    const key = n.getAttribute('key') ?? '';
                    const val = n.textContent ?? '';
                    this.translations[key] = val;
                });
            })
        );
    }

    translate(key: string): string {
        return this.translations[key] ?? key;
    }

    constructor(private http: HttpClient) {}
}