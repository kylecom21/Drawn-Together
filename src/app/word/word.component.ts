import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Word } from '../../../api';
import { WordLengthComponent } from '../word-length/word-length.component';

@Component({
  selector: 'app-word',
  standalone: true,
  imports: [CommonModule, WordLengthComponent],
  template: `
    <div class="word-container">
      <h2 class="word-title">Current Word:</h2>
      <div class="word-info">
        <div class="word-display">{{ word }}</div>
        <app-word-length [word]="word"></app-word-length>
      </div>
    </div>
  `,
  styles: [
    `
      .word-container {
        text-align: center;
        padding: 1rem;
        background-color: #f0f4f8;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .word-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 0.5rem;
      }
      .word-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
      }
      .word-display {
        font-size: 2rem;
        font-weight: bold;
        color: #2d3748;
        padding: 0.5rem 1rem;
        background-color: #ffffff;
        border-radius: 0.5rem;
        display: inline-block;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class WordComponent implements OnInit {
  word: string = '';
  @Input() isActiveDrawer: boolean = false;
  constructor(private wordService: Word) {}

  ngOnInit(): void {
    this.wordService.getWord().subscribe((response) => {
      if(this.isActiveDrawer){
        this.word = response.word;
      } else {
        this.word = 'Guess the word...'
      }
    });
  }
}
