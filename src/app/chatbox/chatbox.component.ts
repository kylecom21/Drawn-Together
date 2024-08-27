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
            [ngClass]="{ 'own-message': message.name === name }"
          >
            <strong>{{ message.name }}:</strong> {{ message.message }}
          </div>
        </div>
        <form (ngSubmit)="sendMessage()">
          <input
            [(ngModel)]="messageInput"
            name="messageInput"
            placeholder="Type a message"
          />
          <button type="submit">Send</button>
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
      }
      .connection-status,
      .user-info {
        margin-bottom: 10px;
        text-align: center;
        font-weight: bold;
      }
      .message-container {
        height: 400px;
        overflow-y: auto;
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 10px;
        background-color: #f9f9f9;
      }
      .message-container div {
        margin-bottom: 5px;
        padding: 5px;
        border-radius: 5px;
        background-color: #e1e1e1;
      }
      .own-message {
        text-align: right;
        background-color: #d1e7dd !important;
      }
      form {
        display: flex;
      }
      input {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px 0 0 4px;
      }
      button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class ChatboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer: ElementRef;

  messages: { name: string; message: string }[] = [];
  messageInput = '';
  name: string = '';
  isConnected: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.initializeWebSocketListeners();
    this.messages = this.websocketService.getMessages();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      const message = { name: this.name, message: this.messageInput };
      this.websocketService.emit('send-chat-message', message);
      this.websocketService.addMessage(message);
      this.messageInput = '';
    }
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
      this.websocketService.messages$.subscribe((messages) => {
        this.messages = messages;
      }),
      this.websocketService
        .listen('user-connected')
        .subscribe((name: string) => {
          this.websocketService.addMessage({
            name: 'System',
            message: `${name} connected`,
          });
        }),
      this.websocketService
        .listen('user-disconnected')
        .subscribe((name: string) => {
          this.websocketService.addMessage({
            name: 'System',
            message: `${name} disconnected`,
          });
        })
    );
  }

  private joinChat() {
    this.name = this.generateRandomName();
    this.websocketService.addMessage({
      name: 'System',
      message: `You joined as ${this.name}`,
    });
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
