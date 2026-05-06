import { Component, EventEmitter, Output } from '@angular/core';
import { Publication, PublicationServiceProxy, FileParameter } from '../../api/service-proxies';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { LocalizePipe } from "../../pipes/localization.pipe";
import { isVideoFile } from '../../api/file-parameter.utils';

interface FilePreview {
    url: string;
    file: File;
    isVideo: boolean;
}

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

    description: string = '';
    previews: FilePreview[] = [];

    loading = false;
    error?: string;

    private readonly maxFiles = 5;

    constructor(
        private publicationService: PublicationServiceProxy,
        loc: LocalizationService
    ) {
        super(loc);
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        for (const file of Array.from(input.files)) {
            this.addFile(file);
        }
        input.value = '';
    }

    onPaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (let item of Array.from(items)) {
            if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
                const file = item.getAsFile();
                if (file) {
                    this.addFile(file);
                    event.preventDefault();
                }
                break;
            }
        }
    }

    private addFile(file: File) {
        if (this.previews.length >= this.maxFiles) return;
        const url = URL.createObjectURL(file);
        this.previews.push({
            url,
            file,
            isVideo: isVideoFile(file)
        });
    }

    removeFile(index: number) {
        const removed = this.previews.splice(index, 1);
        if (removed.length) {
            URL.revokeObjectURL(removed[0].url);
        }
    }

    clearAllFiles() {
        this.previews.forEach(p => URL.revokeObjectURL(p.url));
        this.previews = [];
    }

    onSubmit(form: NgForm) {
        if (form.invalid) return;
        this.loading = true;
        this.error = undefined;

        const fileParams: FileParameter[] = this.previews.map(p => ({
            data: p.file,
            fileName: p.file.name
        }));

        this.publicationService.create(this.description, fileParams).subscribe({
            next: pub => {
                this.loading = false;
                this.clearAllFiles();
                this.description = '';
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
        this.clearAllFiles();
        this.cancelled.emit();
    }
}
