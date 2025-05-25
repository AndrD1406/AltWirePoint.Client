import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicationDto } from '../../api/service-proxies';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocalizePipe } from "../../pipes/localization.pipe";

@Component({
    selector: 'app-publication',
    standalone: true,
    imports: [CommonModule, RouterModule, LocalizePipe],
    templateUrl: './publication.component.html',
    styleUrl: './publication.component.css'
})
export class PublicationComponent {
    @Input() publication!: PublicationDto;
    @Output() like = new EventEmitter<string>();
    @Output() comment = new EventEmitter<string>();

    defaultLogo = '/assets/default-logo.png';

    onLike() {
        this.like.emit(this.publication.id!);
    }

    onComment() {
        this.comment.emit(this.publication.id!);
    }

    get avatarSrc(): string {
        const logo = this.publication.authorLogo;
        if (!logo) {
        return this.defaultLogo;
        }
        // If it's already a full URL or data URI, just use it
        if (logo.startsWith('http') || logo.startsWith('data:')) {
        return logo;
        }
        // Otherwise assume it's raw base64 and prefix accordingly
        return `data:image/png;base64,${logo}`;
    }
}