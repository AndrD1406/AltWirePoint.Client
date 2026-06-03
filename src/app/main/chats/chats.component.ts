import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatServiceProxy, ChatDto } from '../../shared/api/service-proxies';
import { AuthService } from '../../shared/api/auth.service';
import { LocalizePipe } from '../../shared/pipes/localization.pipe';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizePipe],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
    chats: ChatDto[] = [];
    skip = 0;
    take = 20;
    loading = false;
    allLoaded = false;
    myUserId: string = '';

    constructor(
        private chatService: ChatServiceProxy,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.myUserId = this.authService.getUserIdFromToken() || '';
        this.loadNextPage();
    }

    @HostListener('window:scroll', [])
    onScroll() {
        if (this.loading || this.allLoaded) return;
        
        const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
        const max = document.documentElement.scrollHeight;
        if (pos >= max - 50) {
            this.loadNextPage();
        }
    }

    loadNextPage(): void {
        if (this.loading || this.allLoaded) return;

        this.loading = true;
        this.chatService.getChats(this.skip, this.take).subscribe({
            next: (batch: ChatDto[]) => {
                const unique = batch.filter(
                    c => !this.chats.some(existing => existing.id === c.id)
                );
                this.chats = [...this.chats, ...unique];
                this.skip += this.take;
                this.loading = false;
                this.allLoaded = batch.length < this.take;
            },
            error: (err) => {
                console.error('Failed to load chats', err);
                this.loading = false;
                this.allLoaded = true;
            }
        });
    }

    getChatTitle(chat: ChatDto): string {
        if (chat.name) return chat.name;
        
        // If it's a 1-on-1 chat or group without a name, build name from participants
        const others = chat.participants?.filter(p => p.id !== this.myUserId) || [];
        if (others.length === 0) return 'Chat';
        
        if (others.length === 1) return others[0].name || others[0].userName || 'Unknown User';
        
        return others.map(o => o.name || o.userName).join(', ');
    }

    getChatAvatar(chat: ChatDto): string {
        const others = chat.participants?.filter(p => p.id !== this.myUserId) || [];
        if (others.length === 1 && others[0].profilePictureUrl) {
            return others[0].profilePictureUrl;
        }
        return 'assets/default-avatar.png'; // default fallback
    }
    
    getChatLink(chat: ChatDto): string[] {
        // If it's a 1-on-1 chat, route to the other user's id
        const others = chat.participants?.filter(p => p.id !== this.myUserId) || [];
        if (others.length === 1) {
            return ['/chat', others[0].id!];
        }
        
        // If group chats are supported later by ID:
        return ['/chat', chat.id!]; 
    }
}
