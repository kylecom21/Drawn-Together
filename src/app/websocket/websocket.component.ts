import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          (click)="connect()"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect
        </button>
        <button
          (click)="disconnect()"
          class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
        <button
          (click)="sendMessage()"
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Test Message
        </button>
      </div>
      <div class="mt-4 bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto">
        <div *ngFor="let message of messages" class="text-sm text-gray-700">
          {{ message }}
        </div>
      </div>
    </div>
  `,
})
export class WebsocketTestComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  private subscription: Subscription | undefined;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.subscription = this.websocketService
      .listen('message')
      .subscribe((data: any) => {
        this.messages.push(data);
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.disconnect();
  }

  connect() {
    this.websocketService.connect();
    this.messages.push('Attempting to connect...');
    this.websocketService.emit('connection-established', {});
  }

  disconnect() {
    this.websocketService.disconnect();
    this.messages.push('Disconnected from server');
  }

  sendMessage() {
    this.websocketService.emit('message', 'Test message from Angular');
  }
}
