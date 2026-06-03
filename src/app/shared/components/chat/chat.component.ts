import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageComponent } from '../message/message.component';
import { ChatServiceProxy, CreateChatRequest, MessageDto } from '../../api/service-proxies';
import { AuthService } from '../../api/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import * as signalR from '@microsoft/signalr';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LocalizePipe } from '../../pipes/localization.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, MessageComponent, LocalizePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
    messages: MessageDto[] = [];
    newMessage: string = '';
    myUserId: string = '';
    otherUserId: string = '';
    chatId: string = '';
    otherUserName: string = 'Chat';
    errorMessage: string | null = null;
    
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('messageContainer') private messageContainer?: ElementRef<HTMLDivElement>;
    selectedFiles: File[] = [];

    private hubConnection?: signalR.HubConnection;

    constructor(
        private authService: AuthService,
        private chatService: ChatServiceProxy,
        private route: ActivatedRoute,
        private cookieService: CookieService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.myUserId = this.authService.getUserIdFromToken() || '';
        this.otherUserId = this.route.snapshot.paramMap.get('id') || '';

        if (!this.otherUserId) {
            this.errorMessage = "User not found.";
            return;
        }

        // Get or Create Chat
        this.chatService.createChat(new CreateChatRequest({ participantIds: [this.otherUserId] }))
            .subscribe({
                next: (chat) => {
                    this.chatId = chat.id!;
                    
                    // Set the other user's name
                    const otherParticipant = chat.participants?.find(p => p.id === this.otherUserId);
                    if (otherParticipant) {
                        this.otherUserName = otherParticipant.name || otherParticipant.userName || 'Chat';
                    }

                    this.loadMessages();
                    this.setupSignalR();
                },
                error: (err) => {
                    console.error('Failed to initialize chat', err);
                    if (err.status === 401) {
                        this.errorMessage = "Unauthorized. Please log in again.";
                    } else {
                        this.errorMessage = "Failed to load chat. The server might be unavailable.";
                    }
                    this.cdr.detectChanges();
                }
            });
    }

    loadMessages(): void {
        this.chatService.getMessages(this.chatId, 0, 50).subscribe({
            next: (msgs) => {
                // Reverse to show oldest first if API returns newest first, depends on API order.
                // Assuming the API returns them chronologically.
                this.messages = msgs;
                this.scrollToBottom();
            },
            error: (err) => console.error('Failed to load messages', err)
        });
    }

    setupSignalR(): void {
        const token = this.cookieService.get('jwt');
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiBaseUrl}/chathub`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('ReceiveMessage', (messageData: any) => {
            let msg: MessageDto;
            if (messageData instanceof MessageDto) {
                msg = messageData;
            } else {
                msg = MessageDto.fromJS(messageData);
            }

            if (msg.chatId === this.chatId) {
                // Prevent duplicate messages
                if (!this.messages.some(m => m.id === msg.id)) {
                    this.messages.push(msg);
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                }
            }
        });

        this.hubConnection.start()
            .then(() => console.log('SignalR connected'))
            .catch(err => console.error('Error starting SignalR', err));
    }

    triggerFileInput(): void {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: any): void {
        const files = event.target.files as FileList;
        if (files && files.length > 0) {
            // Keep up to 4 files
            for (let i = 0; i < files.length; i++) {
                if (this.selectedFiles.length < 4) {
                    this.selectedFiles.push(files[i]);
                }
            }
        }
        // reset input so the same file can be selected again if removed
        this.fileInput.nativeElement.value = '';
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    sendMessage(): void {
        const content = this.newMessage.trim();
        if ((!content && this.selectedFiles.length === 0) || !this.chatId) return;

        this.newMessage = ''; 
        
        let fileParameters: any[] = [];
        if (this.selectedFiles.length > 0) {
            fileParameters = this.selectedFiles.map(f => {
                return { data: f, fileName: f.name };
            });
        }
        
        const filesToSend = this.selectedFiles; // copy ref
        this.selectedFiles = []; // clear ui immediately

        this.chatService.sendMessage(this.chatId, content || ' ', fileParameters).subscribe({
            next: (msg) => {
                if (!this.messages.some(m => m.id === msg.id)) {
                    this.messages.push(msg);
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                }
            },
            error: (err) => {
                console.error('Failed to send message', err);
            }
        });
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            try {
                if (this.messageContainer) {
                    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
                }
            } catch (err) {
                console.error('Scroll error', err);
            }
        }, 50);
    }
}
