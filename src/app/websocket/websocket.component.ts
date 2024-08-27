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
      <div class="flex flex-col items-center">
        <div
          class="mb-4 px-4 py-2 rounded-full font-semibold text-sm"
          [ngClass]="{
            'bg-yellow-200 text-yellow-800': connectionStatus === 'Connecting',
            'bg-green-200 text-green-800': connectionStatus === 'Connected',
            'bg-red-200 text-red-800': connectionStatus === 'Disconnected'
          }"
        >
          {{ connectionStatus }}
        </div>
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            (click)="connect()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
            [disabled]="connectionStatus === 'Connected'"
          >
            Connect
          </button>
          <button
            (click)="disconnect()"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 font-semibold"
            [disabled]="connectionStatus === 'Disconnected'"
          >
            Disconnect
          </button>
          <button
            (click)="sendMessage()"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-semibold"
            [disabled]="connectionStatus !== 'Connected'"
          >
            Send Test Message
          </button>
        </div>
      </div>
    </div>
  `,
})
export class WebsocketTestComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  connectionStatus: 'Connecting' | 'Connected' | 'Disconnected' =
    'Disconnected';

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.websocketService.connectionStatus$.subscribe(
      (status) => (this.connectionStatus = status)
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.disconnect();
  }

  connect() {
    this.websocketService.connect();
  }

  disconnect() {
    this.websocketService.disconnect();
  }

  sendMessage() {
    this.websocketService.emit('message', 'Test message from Angular');
  }
}
