import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private isActiveDrawerSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isActiveDrawer$: Observable<boolean> =
    this.isActiveDrawerSubject.asObservable();

  private currentWordSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public currentWord$: Observable<string> =
    this.currentWordSubject.asObservable();

  private timerSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  ); // Timer in seconds
  public timer$: Observable<number> = this.timerSubject.asObservable();

  constructor() {}

  setActiveDrawer(isActive: boolean): void {
    this.isActiveDrawerSubject.next(isActive);
  }

  getActiveDrawer(): Observable<boolean> {
    return this.isActiveDrawer$;
  }

  setCurrentWord(word: string): void {
    this.currentWordSubject.next(word);
  }

  getCurrentWord(): Observable<string> {
    return this.currentWord$;
  }

  startTimer(duration: number): void {
    this.timerSubject.next(duration);
    const timerInterval = setInterval(() => {
      const currentTime = this.timerSubject.value;
      if (currentTime > 0) {
        this.timerSubject.next(currentTime - 1);
      } else {
        clearInterval(timerInterval);
      }
    }, 1000);
  }
}
