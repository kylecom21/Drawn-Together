import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class='chatbox-container'>
      <div *ngIf='!name' class='name-input'>
        <input [(ngModel)]='tempName' placeholder='Enter your name'>
        <button (click)='setName()'>Join Chat</button>
      </div>
      <div *ngIf='name'>
        <div #messageContainer class='message-container'>
          <div *ngFor='let message of messages'>{{ message }}</div>
        </div>
        <form (ngSubmit)='sendMessage()'>
          <input [(ngModel)]='messageInput' name='messageInput' placeholder='Type a message'>
          <button type='submit'>Send</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .chatbox-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .name-input {
      margin-bottom: 20px;
    }
    .message-container {
      height: 400px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 10px;
    }
    form, .name-input {
      display: flex;
    }
    input {
      flex-grow: 1;
      padding: 5px;
    }
    button {
      padding: 5px 10px;
    }
  `]
})
export class ChatboxComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  messageInput = '';
  name: string = '';
  tempName: string = '';
  private subscriptions: Subscription[] = [];
  constructor(private websocketService: WebsocketService) {}
  ngOnInit() {
    this.initializeWebSocketListeners();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }
  setName() {
    if (this.tempName.trim()) {
      this.name = this.tempName.trim();
      this.websocketService.connect();
      this.appendMessage('You joined');
      this.websocketService.emit('new-user', this.name);
    }
  }
  sendMessage() {
    if (this.messageInput.trim()) {
      this.appendMessage(`You: ${this.messageInput}`);
      this.websocketService.emit('send-chat-message', this.messageInput);
      this.messageInput = '';
    }
  }
  private appendMessage(message: string) {
    this.messages.push(message);
    // You might want to add logic here to scroll to the bottom of the message container
  }
  private initializeWebSocketListeners() {
    this.subscriptions.push(
      this.websocketService.listen('chat-message').subscribe((data: any) => {
        this.appendMessage(`${data.name}: ${data.message}`);
      }),
      this.websocketService.listen('user-connected').subscribe((name: string) => {
        this.appendMessage(`${name} connected`);
      }),
      this.websocketService.listen('user-disconnected').subscribe((name: string) => {
        this.appendMessage(`${name} disconnected`);
      })
    );
  }
}