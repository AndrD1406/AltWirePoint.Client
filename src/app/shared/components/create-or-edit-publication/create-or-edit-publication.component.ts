import { Component, EventEmitter, Output } from '@angular/core';
import { IPublicationCreateDto, Publication, PublicationCreateDto, PublicationServiceProxy } from '../../api/service-proxies';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { LocalizePipe } from "../../pipes/localization.pipe";

@Component({
    selector: 'app-create-or-edit-publication',
    standalone: true,
    imports: [FormsModule, ButtonModule, MessageModule, CommonModule, LocalizePipe],
    templateUrl: './create-or-edit-publication.component.html'
})
export class CreateOrEditPublicationComponent extends AppComponentBase
{
    @Output() saved = new EventEmitter<Publication>();
    @Output() cancelled = new EventEmitter<void>();

    model: Required<IPublicationCreateDto> = { content: '', image64: '' };
    previewUrl: string | ArrayBuffer | null = null;
    loading = false;
    error?: string;

    constructor(
        private publicationService: PublicationServiceProxy,
        loc: LocalizationService
    ) {
        super(loc);
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.loadFile(input.files[0]);
    }

    onPaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (let item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) this.loadFile(file);
            event.preventDefault();
            break;
        }
        }
    }

    private loadFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
        this.previewUrl = reader.result;
        this.model.image64 = (reader.result as string).split(',')[1];
        };
        reader.readAsDataURL(file);
    }

    clearImage() {
        this.previewUrl = null;
        this.model.image64 = '';
    }

    onSubmit(form: NgForm) {
        if (form.invalid) return;
        this.loading = true;
        this.error = undefined;

        const dto = new PublicationCreateDto();
        dto.content = this.model.content;
        dto.image64 = this.model.image64;

        this.publicationService.create(dto).subscribe({
        next: pub => {
            this.loading = false;
            this.saved.emit(pub);
        },
        error: err => {
            this.loading = false;
            this.error =
            err.error?.detail || this.t('CreationFailed');
        }
        });
    }

    onCancel() {
        this.cancelled.emit();
    }
}
