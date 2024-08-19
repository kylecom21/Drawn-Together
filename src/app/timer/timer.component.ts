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
    <div class="timer">
      <h2>Timer</h2>
      <div class="display">{{ display }}</div>
      <button (click)="startTimer(1)">Start 1 Minute Timer</button>
    </div>
  `,
  styles: [
    `
      .timer {
        text-align: center;
        font-family: Arial, sans-serif;
      }
      .display {
        font-size: 2em;
        margin: 20px 0;
      }
      button {
        padding: 10px 15px;
        font-size: 1em;
        cursor: pointer;
      }
    `,
  ],
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
    console.log('TimerComponent initialized');
    if (this.isBrowser) {
      this.startTimer(1);
    }
  }

  ngOnDestroy() {
    console.log('TimerComponent destroyed');
    this.stopTimer();
  }

  startTimer(minutes: number) {
    if (!this.isBrowser) return;

    console.log(`Starting timer for ${minutes} minute(s)`);
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
        console.log(`Timer update: ${this.display}`);

        if (seconds === 0) {
          console.log('Timer finished');
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
