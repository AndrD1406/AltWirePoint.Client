import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommentDto, PublicationDto, PublicationServiceProxy, FileParameter } from '../../api/service-proxies';
import { CommonModule } from '@angular/common';
import { PublicationComponent } from '../publication/publication.component';
import { PublicationsContainerComponent } from '../publications-container/publications-container.component';
import { LocalizePipe } from '../../pipes/localization.pipe';
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { AuthService } from '../../api/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { isVideoFile } from '../../api/file-parameter.utils';
import { Subscription } from 'rxjs';

interface FilePreview {
    url: string;
    file: File;
    isVideo: boolean;
}

@Component({
  selector: 'publication-view',
  standalone: true,
  imports: [
      CommonModule,
      PublicationComponent,
      PublicationsContainerComponent,
      LocalizePipe,
      FormsModule,
      ButtonModule,
      MessageModule,
      DialogModule
  ],
  templateUrl: './publication-view.component.html',
  styleUrl: './publication-view.component.css'
})
export class PublicationViewComponent extends AppComponentBase implements OnInit, OnDestroy {
    publication?: PublicationDto;
    loading = true;

    showCommentDialog = false;
    commentContent = '';
    commentPreviews: FilePreview[] = [];
    commentError?: string;
    commentLoading = false;

    private readonly maxFiles = 5;
    private routeSub?: Subscription;

    constructor(
        private route: ActivatedRoute,
        private publicationService: PublicationServiceProxy,
        private authService: AuthService,
        private cd: ChangeDetectorRef,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit(): void {
        this.routeSub = this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadPublication(id);
            }
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }

    private loadPublication(id: string) {
        this.publication = undefined;
        this.loading = true;

        this.publicationService.getById(id).subscribe({
            next: (pub) => {
                this.publication = pub;
                this.loading = false;
                this.cd.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cd.markForCheck();
            }
        });
    }

    handleLike() {
        if (!this.publication?.id) return;
        this.publicationService.like(this.publication.id).subscribe(likeDto => {
            this.publication!.isLikedByCurrentUser = likeDto.isLiked;
            if (likeDto.isLiked) {
                this.publication!.likeCount = (this.publication!.likeCount || 0) + 1;
            } else {
                this.publication!.likeCount = Math.max(0, (this.publication!.likeCount || 0) - 1);
            }
        });
    }

    handleComment() {
        this.commentContent = '';
        this.clearCommentFiles();
        this.showCommentDialog = true;
    }

    onPaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
                const file = item.getAsFile();
                if (file) {
                    this.addCommentFile(file);
                    event.preventDefault();
                }
                break;
            }
        }
    }

    onFileChange(ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (!input.files?.length) return;
        for (const file of Array.from(input.files)) {
            this.addCommentFile(file);
        }
        input.value = '';
    }

    private addCommentFile(file: File) {
        if (this.commentPreviews.length >= this.maxFiles) return;
        const url = URL.createObjectURL(file);
        this.commentPreviews.push({
            url,
            file,
            isVideo: isVideoFile(file)
        });
    }

    removeCommentFile(index: number) {
        const removed = this.commentPreviews.splice(index, 1);
        if (removed.length) {
            URL.revokeObjectURL(removed[0].url);
        }
    }

    clearCommentFiles() {
        this.commentPreviews.forEach(p => URL.revokeObjectURL(p.url));
        this.commentPreviews = [];
    }

    submitComment(form: NgForm) {
        if (form.invalid || !this.publication?.id) return;
        this.commentLoading = true;
        this.commentError = undefined;

        const authorId = this.authService.getUserIdFromToken()!;
        const fileParams: FileParameter[] = this.commentPreviews.map(p => ({
            data: p.file,
            fileName: p.file.name
        }));

        this.publicationService.comment(
            this.publication.id,
            authorId,
            this.commentContent,
            fileParams
        ).subscribe({
            next: (newComment: CommentDto) => {
                this.commentLoading = false;
                this.publication!.commentCount = (this.publication!.commentCount || 0) + 1;
                this.clearCommentFiles();
                this.showCommentDialog = false;
            },
            error: err => {
                this.commentLoading = false;
                this.commentError =
                    err.error?.detail || this.t('FailedToAddComment');
            }
        });
    }

    cancelComment() {
        this.clearCommentFiles();
        this.showCommentDialog = false;
    }
}
