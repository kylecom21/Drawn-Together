import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameStateService } from '../game-state.service'; // Ensure GameStateService is imported
import { WebsocketService } from '../web-socket.service'; // Import WebSocketService

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer text-center font-sans">
      <h2 class="text-xl font-semibold mb-2">Timer</h2>
      <div class="display text-4xl font-bold mb-4">{{ display }}</div>
      <div class="timer-btn">
      <button
        *ngIf="isActiveDrawer"
        (click)="startTimer(1)"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-grey-500 transition duration-200 ease-in-out"
      >
        Start 1 Minute Timer
      </button>
</div>
    </div>
  `,
})
export class TimerComponent implements OnInit, OnDestroy {
  display: string = '01:00';
  private timerSubscription: Subscription | null = null;
  private socketSubscription: Subscription | null = null; // New subscription for WebSocket
  private readonly SECONDS_IN_MINUTE = 60;
  private isBrowser: boolean;
  isActiveDrawer: boolean = false; // To track if the user is the active drawer

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private gameStateService: GameStateService, // Inject GameStateService
    private websocketService: WebsocketService // Inject WebSocketService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Subscribe to the active drawer state
      this.gameStateService.isActiveDrawer$.subscribe((isActive) => {
        this.isActiveDrawer = isActive;
      });

      // Subscribe to timer updates from the WebSocket
      this.socketSubscription = this.websocketService
        .listen('timer-update')
        .subscribe((duration: number) => {
          this.updateDisplay(duration);
        });

      // Subscribe to timer end event
      this.websocketService.listen('timer-ended').subscribe(() => {
        this.display = '00:00';
      });
    }
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  startTimer(minutes: number) {
    if (!this.isBrowser || !this.isActiveDrawer) return; // Check if active drawer

    this.websocketService.emit('start-timer', minutes * this.SECONDS_IN_MINUTE); // Emit start timer event to the server
  }

  private updateDisplay(seconds: number) {
    const minutesRemaining = Math.floor(seconds / this.SECONDS_IN_MINUTE);
    const secondsRemaining = seconds % this.SECONDS_IN_MINUTE;
    this.display = `${minutesRemaining
      .toString()
      .padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }
}
