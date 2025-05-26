import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationServiceProxy, CommentDto } from '../../api/service-proxies';
import { AppComponentBase } from '../../app-component-base';
import { LocalizationService } from '../../services/localization.service';
import { LocalizePipe } from '../../pipes/localization.pipe';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    CommonModule,
    LocalizePipe,
    MessageModule
  ],
  templateUrl: './comments.component.html'
})
export class CommentsComponent extends AppComponentBase implements OnChanges
{
    @Input() publicationId?: string;

    comments: CommentDto[] = [];
    loading = false;
    error?: string;
    defaultLogo = '/assets/default-logo.png';

    constructor(
        private publicationService: PublicationServiceProxy,
        loc: LocalizationService
    ) {
        super(loc);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['publicationId'] && this.publicationId) {
        this.loadComments();
        }
    }

    private loadComments(): void {
        this.loading = true;
        this.error = undefined;
        this.publicationService
        .getCommentsForPublication(this.publicationId)
        .subscribe({
            next: comments => {
            this.comments = comments;
            this.loading = false;
            },
            error: () => {
            this.error = this.t('FailedToLoadComments');
            this.loading = false;
            }
        });
    }

    getAvatarSrc(logo?: string): string {
        if (!logo) return this.defaultLogo;
        return logo.startsWith('http') || logo.startsWith('data:')
        ? logo
        : `data:image/png;base64,${logo}`;
    }
}