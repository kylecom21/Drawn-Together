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
}
