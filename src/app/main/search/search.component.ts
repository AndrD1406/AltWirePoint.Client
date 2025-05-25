import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { PublicationsContainerComponent } from '../../shared/components/publications-container/publications-container.component';
import { LocalizePipe } from "../../shared/pipes/localization.pipe";

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
    FormsModule,
    InputTextModule,
    InputGroupModule,
    ButtonModule,
    PublicationsContainerComponent,
    LocalizePipe
],
    templateUrl: './search.component.html',
})
export class SearchComponent {
    searchQuery = '';

    clearSearch() {
        this.searchQuery = '';
    }
}
