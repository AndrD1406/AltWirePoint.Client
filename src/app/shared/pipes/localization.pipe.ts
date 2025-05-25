import { Pipe, PipeTransform } from "@angular/core";
import { LocalizationService } from "../services/localization.service";

@Pipe({ name: 'localize', standalone: true, pure: false })
export class LocalizePipe implements PipeTransform {
    constructor(private localizationService: LocalizationService) {}

    transform(key: string): string {
        return this.localizationService.translate(key);
    }
}