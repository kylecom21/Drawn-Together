import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="connection-btn">
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
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 font-semibold"
            [disabled]="connectionStatus === 'Connected'"
          >
            Connect
          </button>
          <button
            (click)="disconnect()"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 font-semibold"
            [disabled]="connectionStatus === 'Disconnected'"
          >
            Disconnect
          </button>
        </div>
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
    this.subscription = this.websocketService.connectionStatus$.subscribe(
      (status) => (this.connectionStatus = status)
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  connect() {
    this.websocketService.connect();
  }

  disconnect() {
    this.websocketService.disconnect();
  }
}
