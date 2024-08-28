import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbox-container">
      <div *ngIf="!isConnected" class="connection-status">
        Waiting for connection...
      </div>
      <div *ngIf="isConnected">
        <div class="user-info">You are: {{ name }}</div>
        <div #messageContainer class="message-container">
          <div
            *ngFor="let message of messages"
            [ngClass]="{ 'own-message': message.startsWith('You:') }"
          >
            {{ message }}
          </div>
        </div>
        <form (ngSubmit)="sendMessage()" *ngIf="!isRoundOver">
          <input
            [(ngModel)]="messageInput"
            name="messageInput"
            placeholder="Type a message"
            [disabled]="isRoundOver"
          />
          />
          <button type="submit" [disabled]="isRoundOver">Send</button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .chatbox-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        background-color: #c8d3be;
        padding-top: 7px;
        padding-bottom: 1px;
      }
      .connection-status,
      .user-info {
        margin-bottom: 10px;
        text-align: center;
        font-weight: bold;
        background-color: #c8d3be;
      }
      .message-container {
        height: 400px;
        overflow-y: auto;
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 10px;
        background-color: #c8d3be;
      }
      .message-container div {
        margin-bottom: 5px;
        padding: 5px;
        border-radius: 5px;
        background-color: #969f8e;
        color: white;
      }
      .own-message {
        text-align: right;
        background-color: #7a8273 !important;
      }
      form {
        display: flex;
      }
      input {
        flex-grow: 1;
        border: 1px solid #ccc;
        border-radius: 4px 0 0 4px;
        padding: 2px;
      }
      button {
        background-color: gray;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
        padding: 5px;
      }
      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class ChatboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer: ElementRef;

  messages: string[] = [];
  messageInput = '';
  name: string = '';
  isConnected: boolean = false;
  isRoundOver: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.initializeWebSocketListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      this.websocketService.emit('send-chat-message', {
        name: this.name,
        message: this.messageInput,
      });
      this.appendMessage(`You: ${this.messageInput}`);
      this.messageInput = '';
    }
  }

  private appendMessage(message: string) {
    this.messages.push(message);
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private initializeWebSocketListeners() {
    this.subscriptions.push(
      this.websocketService.connectionStatus$.subscribe((status) => {
        this.isConnected = status === 'Connected';
        if (this.isConnected && !this.name) {
          this.joinChat();
        }
      }),
      this.websocketService.listen('chat-message').subscribe((data: any) => {
        if (data.name === 'System') {
          this.appendMessage(data.message);
        } else {
          this.appendMessage(`${data.name}: ${data.message}`);
        }
      }),
      this.websocketService
        .listen('user-connected')
        .subscribe((name: string) => {
          this.appendMessage(`${name} connected`);
        }),
      this.websocketService
        .listen('user-disconnected')
        .subscribe((name: string) => {
          this.appendMessage(`${name} disconnected`);
        }),
      this.websocketService.listen('timer-ended').subscribe(() => {
        this.isRoundOver = true; 
        this.appendMessage('Round Over'); 
      })
    );
  }

  private joinChat() {
    this.name = this.generateRandomName();
    this.appendMessage(`You joined as ${this.name}`);
    this.websocketService.emit('new-user', this.name);
  }

  private generateRandomName(): string {
    const adjectives = ['Happy', 'Clever', 'Brave', 'Kind', 'Swift'];
    const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox'];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 100)}`;
  }
}
