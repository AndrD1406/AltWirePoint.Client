import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PublicationDto, PublicationServiceProxy } from '../../api/service-proxies';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocalizePipe } from "../../pipes/localization.pipe";
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../api/auth.service';
import { isVideoUrl } from '../../api/file-parameter.utils';

@Component({
    selector: 'app-publication',
    standalone: true,
    imports: [CommonModule, RouterModule, LocalizePipe,
         MenuModule, ConfirmDialogModule, ButtonModule],
    providers: [ConfirmationService],
    templateUrl: './publication.component.html',
    styleUrl: './publication.component.css'
})
export class PublicationComponent extends AppComponentBase implements OnInit {
    @Input() publication!: PublicationDto;
    @Output() deleted = new EventEmitter<string>();
    @Output() like = new EventEmitter<string>();
    @Output() comment = new EventEmitter<string>();
    @Output() view = new EventEmitter<string>();

    defaultLogo = '/assets/default-logo.png';

    menuItems: MenuItem[] = [];
    isOwn = false;

    constructor(
        private publicationService: PublicationServiceProxy,
        private confirmation: ConfirmationService,
        private authService: AuthService,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit() {
        // determine ownership
        const myId = this.authService.getUserIdFromToken();
        this.isOwn = myId === this.publication.authorId;

        // only show delete menu when it's your own post
        // TODO: re-add edit once an update API endpoint exists
        this.menuItems = [
            {
                label: this.t('Delete'),
                icon: 'pi pi-trash',
                command: () => this.confirmDelete(),
                visible: this.isOwn
            }
        ];
    }
    
    onView() {
        this.view.emit(this.publication.id!);
    }

    onLike() {
        this.like.emit(this.publication.id!);
    }

    onComment() {
        this.comment.emit(this.publication.id!);
    }

    isVideo(url: string): boolean {
        return isVideoUrl(url);
    }

    confirmDelete() {
        this.confirmation.confirm({
        header: this.t('Confirm'),
        message: this.t('ConfirmDeletePublication'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.t('Yes'),
        rejectLabel: this.t('No'),
        accept: () => {
            const id = this.publication.id!;
            this.publicationService.delete(id)
            .subscribe(() => this.deleted.emit(id));
        }
        });
    }

    get avatarSrc(): string {
        const logo = this.publication.authorLogo;
        if (!logo) return this.defaultLogo;
        return logo.startsWith('http') || logo.startsWith('data:')
        ? logo
        : `data:image/png;base64,${logo}`;
    }
}