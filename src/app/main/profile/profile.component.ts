import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountServiceProxy, EditProfileDto, ProfileDto, PublicationDto, PublicationServiceProxy } from '../../shared/api/service-proxies';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/api/auth.service';
import { Dialog } from 'primeng/dialog';
import { NgForm } from '@angular/forms';
import { EditProfileComponent } from '../../shared/components/edit-profile/edit-profile.component';
import { PublicationsContainerComponent } from '../../shared/components/publications-container/publications-container.component';
import { LocalizePipe } from "../../shared/pipes/localization.pipe";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, PublicationsContainerComponent, Dialog, EditProfileComponent, LocalizePipe],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    profile?: ProfileDto;
    isOwnProfile = false;

    showEditDialog = false;
    editModel = new EditProfileDto();
    loading = false;
    error?: string;

    constructor(
        private route: ActivatedRoute,
        private publicationService: PublicationServiceProxy,
        private accountService: AccountServiceProxy,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        let id = this.route.snapshot.paramMap.get('id')
            || this.authService.getUserIdFromToken()!;
        if (!id) return;

        this.isOwnProfile = id === this.authService.getUserIdFromToken();

        this.publicationService.getUserById(id)
        .subscribe(dto => {
            this.profile = dto;
            this.editModel = new EditProfileDto();
            this.editModel.name = dto.name;
            this.editModel.logo = dto.logo;
        });
    }

    getLogoSrc(logo?: string): string {
        if (!logo) return '/assets/default-logo.png';
        if (logo.startsWith('data:') || logo.startsWith('http')) return logo;
        return `data:image/png;base64,${logo}`;
    }

    openEditDialog() {
        if (!this.profile) return;
        this.editModel = new EditProfileDto();
        this.editModel.name = this.profile.name;
        this.editModel.logo = this.profile.logo;
        this.showEditDialog = true;
    }

    onEditSubmit(form: NgForm) {
        if (form.invalid) return;
        this.loading = true;
        this.accountService.editProfile(this.editModel)
        .subscribe({
            next: updated => {
            this.loading = false;
            this.profile = updated;
            this.showEditDialog = false;
            },
            error: err => {
            this.loading = false;
            this.error = err.message || 'Update failed';
            }
        });
    }
}
