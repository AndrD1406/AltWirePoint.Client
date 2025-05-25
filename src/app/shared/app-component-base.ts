import { LocalizationService } from "./services/localization.service";

export abstract class AppComponentBase {
    protected constructor(protected loc: LocalizationService) {}

    protected t(key: string): string {
        return this.loc.translate(key);
    }

    protected getLogoSrc(logo?: string): string {
        if (!logo) return '/assets/default-logo.png';
        if (logo.startsWith('data:') || logo.startsWith('http')) return logo;
        return `data:image/png;base64,${logo}`;
    }
}