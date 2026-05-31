import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountServiceProxy, FollowServiceProxy, FollowStatsDto, ProfileDto, PublicationServiceProxy } from '../../shared/api/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/api/auth.service';
import { Dialog } from 'primeng/dialog';
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

    isFollowing = false;
    followLoading = false;
    followStats?: FollowStatsDto;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private publicationService: PublicationServiceProxy,
        private accountService: AccountServiceProxy,
        private authService: AuthService,
        private followService: FollowServiceProxy
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            let id = params.get('id');
            
            // If the URL is explicitly /profile/null or empty, fallback to the current user's token
            if (!id || id === 'null' || id === 'undefined') {
                id = this.authService.getUserIdFromToken();
            }

            if (!id) return;

            this.isOwnProfile = id === this.authService.getUserIdFromToken();

            this.accountService.getUserById(id)
            .subscribe(dto => {
                this.profile = dto;
            });

            this.followService.stats(id).subscribe(stats => {
                this.followStats = stats;
            });

            if (!this.isOwnProfile) {
                this.followService.isFollowing(id).subscribe(following => {
                    this.isFollowing = following;
                });
            }
        });
    }

    getLogoSrc(logo?: string): string {
        if (!logo) return '/assets/default-logo.png';
        if (logo.startsWith('data:') || logo.startsWith('http')) return logo;
        return `data:image/png;base64,${logo}`;
    }

    openEditDialog() {
        if (!this.profile) return;
        this.showEditDialog = true;
    }

    goToChat() {
        if (!this.profile) return;
        this.router.navigate(['/chat', this.profile.userId]);
    }

    toggleFollow() {
        if (!this.profile?.userId || this.followLoading) return;
        this.followLoading = true;
        this.followService.toggle(this.profile.userId).subscribe({
            next: (result) => {
                this.isFollowing = result.isFollowing ?? false;
                // refresh follower count
                this.followService.stats(this.profile!.userId!).subscribe(stats => {
                    this.followStats = stats;
                });
                this.followLoading = false;
            },
            error: () => { this.followLoading = false; }
        });
    }
}
