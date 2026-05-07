import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AccountServiceProxy, ProfileDto, FileParameter } from '../../api/service-proxies';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { LocalizePipe } from "../../pipes/localization.pipe";

@Component({
    selector: 'edit-profile',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    LocalizePipe
],
    templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent extends AppComponentBase implements OnInit {
    @Input() name: string = '';
    @Input() initialProfilePictureUrl?: string;

    @Output() saved     = new EventEmitter<ProfileDto>();
    @Output() cancelled = new EventEmitter<void>();

    previewUrl: string | null = null;
    selectedFile?: File;
    loading = false;
    error?: string;

    constructor(
        private accountService: AccountServiceProxy,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit() {
        this.previewUrl = this.initialProfilePictureUrl || null;
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.loadFile(input.files[0]);
    }

    onPaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
            this.loadFile(file);
            event.preventDefault();
            }
            break;
        }
        }
    }

    private loadFile(file: File) {
        const maxPx = 1024;
        const reader = new FileReader();
        reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > maxPx || img.naturalHeight > maxPx) {
            this.error = this.t('ImageTooLarge').replace('{0}', maxPx.toString());
            this.previewUrl = null;
            this.selectedFile = undefined;
            } else {
            this.error = undefined;
            this.previewUrl = dataUrl;
            this.selectedFile = file;
            }
        };
        img.onerror = () => {
            this.error = this.t('InvalidImageFile');
        };
        img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }

    clearImage() {
        this.previewUrl = null;
        this.selectedFile = undefined;
    }

    onSubmit(form: NgForm) {
        if (form.invalid) return;
        this.loading = true;
        this.error   = undefined;

        let fileParam: FileParameter | undefined = undefined;
        if (this.selectedFile) {
            fileParam = { data: this.selectedFile, fileName: this.selectedFile.name };
        }

        this.accountService.editProfile(this.name, fileParam).subscribe({
        next: updated => {
            this.loading = false;
            this.saved.emit(updated);
        },
        error: err => {
            this.loading = false;
            this.error = err.error?.detail || this.t('UpdateFailed');
        }
        });
    }

    onCancel() {
        this.cancelled.emit();
    }
}
