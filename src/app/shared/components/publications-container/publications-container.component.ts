import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommentCreateDto, CommentDto, PublicationDto, PublicationServiceProxy } from '../../api/service-proxies';
import { PublicationComponent } from "../publication/publication.component";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../api/auth.service';
import { fromEvent, map, throttleTime } from 'rxjs';
import { LocalizePipe } from "../../pipes/localization.pipe";
import { LocalizationService } from '../../services/localization.service';
import { AppComponentBase } from '../../app-component-base';

@Component({
    selector: 'publications-container',
    standalone: true,
    imports: [PublicationComponent, CommonModule, ButtonModule, MessageModule, DialogModule, FormsModule, LocalizePipe],
    templateUrl: './publications-container.component.html',
    styleUrl: './publications-container.component.css',
    
})
export class PublicationsContainerComponent
    extends AppComponentBase
    implements OnInit
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

    publications: PublicationDto[] = [];
    skip = 0;
    take = 10;
    loading = false;
    allLoaded = false;

    showCommentDialog = false;
    commentModel = new CommentCreateDto();
    previewUrl: string | ArrayBuffer | null = null;
    commentError?: string;
    commentLoading = false;

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
            : this.publicationService.getWithDetailsPaged(
                  currentSkip,
                  this.take
              );

        page$.subscribe({
            next: batch => {
                const unique = batch.filter(
                    p => !this.publications.some(x => x.id === p.id)
                );
                unique.forEach(
                    p => (p.likes = (p.likes || []).filter(l => l.isLiked))
                );

                this.publications = [...this.publications, ...unique];
                this.loading = false;
                this.allLoaded = batch.length < this.take;
                this.cd.markForCheck();
            },
            error: err => {
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
        this.commentModel = new CommentCreateDto();
        this.commentModel.publicationId = pubId;
        this.commentModel.authorId =
            this.authService.getUserIdFromToken()!;
        this.previewUrl = null;
        this.showCommentDialog = true;
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

    onFileChange(ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.loadFile(input.files[0]);
    }

    private loadFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            this.previewUrl = reader.result;
            const dataUrl = reader.result as string;
            this.commentModel.image64 = dataUrl.split(',')[1];
        };
        reader.readAsDataURL(file);
    }

    clearImage() {
        this.previewUrl = null;
        this.commentModel.image64 = undefined;
    }

    submitComment(form: NgForm) {
        if (form.invalid) return;
        this.commentLoading = true;
        this.commentError = undefined;

        this.publicationService.comment(this.commentModel).subscribe({
            next: (newComment: CommentDto) => {
                this.commentLoading = false;
                const parent = this.publications.find(
                    p => p.id === newComment.parentId
                );
                if (parent) {
                    parent.comments = parent.comments || [];
                    parent.comments.push(newComment);
                }
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
        this.showCommentDialog = false;
    }

    getImageSrc(image: string | ArrayBuffer | null | undefined): string {
        if (!image) return '';
        const str = image.toString();
        if (str.startsWith('data:') || str.startsWith('http')) {
            return str;
        }
        return `data:image/png;base64,${str}`;
    }
}