import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommentDto, LikeDto, PublicationDto, PublicationServiceProxy, FileParameter } from '../../api/service-proxies';
import { PublicationComponent } from "../publication/publication.component";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../api/auth.service';
import { LocalizePipe } from "../../pipes/localization.pipe";
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';
import { isVideoFile } from '../../api/file-parameter.utils';

interface FilePreview {
    url: string;
    file: File;
    isVideo: boolean;
}

@Component({
    selector: 'publications-container',
    standalone: true,
    imports: [PublicationComponent, CommonModule, ButtonModule, MessageModule, DialogModule, FormsModule, LocalizePipe],
    templateUrl: './publications-container.component.html',
    styleUrl: './publications-container.component.css',
    
})
export class PublicationsContainerComponent extends AppComponentBase implements OnInit
{
    @Input() authorId?: string;

    private _searchQuery = '';
    @Input()
    set searchQuery(q: string | undefined) {
        const normalized = q ?? '';
        if (normalized !== this._searchQuery) {
            this._searchQuery = normalized;
            this.resetAndLoad();
        }
    }
    get searchQuery(): string {
        return this._searchQuery;
    }

    @ViewChild('scrollContainer', { static: true })
    scrollContainer!: ElementRef<HTMLElement>;

    selectedPub?: PublicationDto;
    showDetailDialog = false;

    publications: PublicationDto[] = [];
    skip = 0;
    take = 10;
    loading = false;
    allLoaded = false;

    showCommentDialog = false;
    commentPublicationId = '';
    commentAuthorId = '';
    commentContent = '';
    commentPreviews: FilePreview[] = [];
    commentError?: string;
    commentLoading = false;

    private readonly maxFiles = 5;

    constructor(
        private publicationService: PublicationServiceProxy,
        private authService: AuthService,
        private cd: ChangeDetectorRef,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnInit(): void {
        this.loadNextPage();
    }

    resetAndLoad() {
        this.skip = 0;
        this.publications = [];
        this.allLoaded = false;
        this.loadNextPage();
    }

    handleView(id: string) {
        const p = this.publications.find(x => x.id === id);
        if (!p) return;
        this.selectedPub = p;
        this.showDetailDialog = true;
    }

    trackByPub(_: number, pub: PublicationDto) {
        return pub.id;
    }

    onScroll() {
        const el = this.scrollContainer.nativeElement;
        if (
            !this.loading &&
            !this.allLoaded &&
            el.scrollTop + el.clientHeight >= el.scrollHeight - 50
        ) {
            this.loadNextPage();
        }
    }

    private loadNextPage() {
        if (this.loading || this.allLoaded) return;

        this.loading = true;
        const currentSkip = this.skip;
        this.skip += this.take;

        const page$ = this._searchQuery
            ? this.publicationService.search(
                  this._searchQuery,
                  currentSkip,
                  this.take
              )
            : this.authorId
            ? this.publicationService.getByUserIdPaged(
                  this.authorId,
                  currentSkip,
                  this.take
              )
            : this.publicationService.get(
                  currentSkip,
                  this.take
              );

        page$.subscribe({
            next: (batch: PublicationDto[]) => {
                const unique = batch.filter(
                    (p: PublicationDto) => !this.publications.some(x => x.id === p.id)
                );
                unique.forEach(
                    (p: PublicationDto) => (p.likes = (p.likes || []).filter((l: LikeDto) => l.isLiked))
                );

                this.publications = [...this.publications, ...unique];
                this.loading = false;
                this.allLoaded = batch.length < this.take;
                this.cd.markForCheck();
            },
            error: (err: any) => {
                this.loading = false;
                this.allLoaded = true;
                this.commentError =
                    err.error?.detail || this.t('FailedToAddComment');
                this.cd.markForCheck();
            }
        });
    }

    handleLike(pubId: string) {
        const pub = this.publications.find(p => p.id === pubId)!;
        this.publicationService.like(pubId).subscribe(likeDto => {
            pub.likes = pub.likes || [];
            const idx = pub.likes.findIndex(l => l.id === likeDto.id);
            if (idx > -1) pub.likes[idx] = likeDto;
            else pub.likes.push(likeDto);
            pub.likes = pub.likes.filter(l => l.isLiked);
        });
    }

    handleComment(pubId: string) {
        this.commentPublicationId = pubId;
        this.commentAuthorId = this.authService.getUserIdFromToken()!;
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
        if (form.invalid) return;
        this.commentLoading = true;
        this.commentError = undefined;

        const fileParams: FileParameter[] = this.commentPreviews.map(p => ({
            data: p.file,
            fileName: p.file.name
        }));

        this.publicationService.comment(
            this.commentPublicationId,
            this.commentAuthorId,
            this.commentContent,
            fileParams
        ).subscribe({
            next: (newComment: CommentDto) => {
                this.commentLoading = false;
                const parent = this.publications.find(
                    p => p.id === newComment.parentId
                );
                if (parent) {
                    parent.comments = parent.comments || [];
                    parent.comments.push(newComment);
                }
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