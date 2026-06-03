import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { TabsModule } from 'primeng/tabs';
import { PublicationsContainerComponent } from '../../shared/components/publications-container/publications-container.component';
import { LocalizePipe } from "../../shared/pipes/localization.pipe";
import { AccountServiceProxy, ProfileDto } from '../../shared/api/service-proxies';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        InputGroupModule,
        ButtonModule,
        TabsModule,
        PublicationsContainerComponent,
        LocalizePipe
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent {
    searchQuery = '';
    activeTab: 'top' | 'latest' | 'people' = 'top';

    // People search
    people: ProfileDto[] = [];
    peopleLoading = false;
    peopleSkip = 0;
    peopleTake = 10;
    peopleAllLoaded = false;

    private lastPeopleQuery = '';

    constructor(
        private accountService: AccountServiceProxy,
        private router: Router
    ) {}

    onTabChange(index: string | number) {
        const idx = Number(index);
        const tabs: ('top' | 'latest' | 'people')[] = ['top', 'latest', 'people'];
        this.activeTab = tabs[idx] || 'top';
        if (this.activeTab === 'people' && this.searchQuery) {
            this.resetPeopleSearch();
        }
    }

    onSearchChange() {
        if (this.activeTab === 'people' && this.searchQuery) {
            this.resetPeopleSearch();
        }
    }

    get sortBy(): string {
        return this.activeTab === 'latest' ? 'latest' : 'top';
    }

    // People search logic
    resetPeopleSearch() {
        this.people = [];
        this.peopleSkip = 0;
        this.peopleAllLoaded = false;
        this.lastPeopleQuery = this.searchQuery;
        this.loadPeople();
    }

    loadPeople() {
        if (this.peopleLoading || this.peopleAllLoaded || !this.searchQuery) return;
        this.peopleLoading = true;

        this.accountService.searchUsers(this.searchQuery, this.peopleSkip, this.peopleTake)
            .subscribe({
                next: (batch) => {
                    const unique = batch.filter(
                        p => !this.people.some(x => x.userId === p.userId)
                    );
                    this.people = [...this.people, ...unique];
                    this.peopleSkip += this.peopleTake;
                    this.peopleAllLoaded = batch.length < this.peopleTake;
                    this.peopleLoading = false;
                },
                error: () => {
                    this.peopleLoading = false;
                    this.peopleAllLoaded = true;
                }
            });
    }

    goToProfile(userId: string | undefined) {
        if (userId) {
            this.router.navigate(['/profile', userId]);
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.people = [];
    }
}
