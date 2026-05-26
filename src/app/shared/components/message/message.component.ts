import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageDto } from '../../api/service-proxies';
import { AuthService } from '../../api/auth.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input({ required: true }) message!: MessageDto;
  
  constructor(private authService: AuthService) {}

  get isMine(): boolean {
    return this.message.senderId === this.authService.getUserIdFromToken();
  }

  get profilePicture(): string {
    const logo = this.message.senderProfilePictureUrl;
    if (!logo) return '/assets/default-logo.png';
    if (logo.startsWith('data:') || logo.startsWith('http')) return logo;
    return `data:image/png;base64,${logo}`;
  }

  get sentAtLocal(): Date | null {
    if (!this.message.sentAt) return null;
    let d = this.message.sentAt;
    if (!d.endsWith('Z')) {
      d += 'Z';
    }
    return new Date(d);
  }
}
