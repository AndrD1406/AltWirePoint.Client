import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PublicationCreateDto, PublicationDto, PublicationServiceProxy } from '../../api/service-proxies';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocalizePipe } from "../../pipes/localization.pipe";
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { DialogModule } from 'primeng/dialog';
import { CreateOrEditPublicationComponent } from '../create-or-edit-publication/create-or-edit-publication.component';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../api/auth.service';

@Component({
    selector: 'app-publication',
    standalone: true,
    imports: [CommonModule, RouterModule, LocalizePipe, DialogModule, CreateOrEditPublicationComponent,
         MenuModule, PanelMenuModule, ConfirmDialogModule, ButtonModule],
    providers: [ConfirmationService],
    templateUrl: './publication.component.html',
    styleUrl: './publication.component.css'
})
export class PublicationComponent extends AppComponentBase implements OnInit {
    @Input() publication!: PublicationDto;
    @Output() deleted = new EventEmitter<string>();
    @Output() like    = new EventEmitter<string>();
    @Output() comment = new EventEmitter<string>();
    @Output() view    = new EventEmitter<string>();

    defaultLogo = '/assets/default-logo.png';

    menuItems: MenuItem[] = [];
    showEditDialog = false;
    updateModel = new PublicationCreateDto();
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

        // only show edit/delete menu when it's your own post
        if (this.isOwn) {
        this.menuItems = [
            {
            label: this.t('EditPublication'),
            icon: 'pi pi-pencil',
            command: () => this.openEdit()
            },
            {
            label: this.t('Delete'),
            icon: 'pi pi-trash',
            command: () => this.confirmDelete()
            }
        ];
        }
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

    openEdit() {
        this.updateModel.content = this.publication.content || '';
        this.updateModel.image64  = this.publication.image64 || '';
        this.showEditDialog       = true;
    }

    onSaveEdited(dto: PublicationCreateDto) {
        this.publicationService.update(this.publication.id, dto)
        .subscribe(resultArray => {
            const updated = resultArray[0];
            this.publication.content = updated.content;
            this.publication.image64 = updated.image64;
            this.showEditDialog = false;
        });
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