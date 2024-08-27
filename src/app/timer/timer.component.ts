import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer text-center font-sans">
      <h2 class="text-xl font-semibold mb-2">Timer</h2>
      <div class="display text-4xl font-bold mb-4">{{ display }}</div>
      <button
        (click)="startTimer(1)"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 ease-in-out"
      >
        Start 1 Minute Timer
      </button>
    </div>
  `,
})
export class TimerComponent implements OnInit, OnDestroy {
  display: string = '01:00';
  private timerSubscription: Subscription | null = null;
  private readonly SECONDS_IN_MINUTE = 60;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startTimer(1);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer(minutes: number) {
    if (!this.isBrowser) return;

    this.stopTimer(); // Ensure any existing timer is stopped
    let seconds: number = minutes * this.SECONDS_IN_MINUTE;
    const prefix = minutes < 10 ? '0' : '';

    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => seconds > 0))
      .subscribe(() => {
        seconds--;
        const minutesRemaining = Math.floor(seconds / this.SECONDS_IN_MINUTE);
        const secondsRemaining = seconds % this.SECONDS_IN_MINUTE;
        this.display = `${prefix}${minutesRemaining}:${secondsRemaining
          .toString()
          .padStart(2, '0')}`;

        if (seconds === 0) {
          this.stopTimer();
        }
      });
  }

  private stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
