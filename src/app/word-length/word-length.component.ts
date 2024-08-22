import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-word-length',
  standalone: true,
  template: `
    <div class="word-length-container">
      <p class="word-length-title">Length of the word:</p>
      <div class="word-length-display">{{ wordLength }}</div>
    </div>
  `,
  styles: [
    `
      .word-length-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .word-length-title {
        font-size: 1rem;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 0.5rem;
      }
      .word-length-display {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2d3748;
      }
    `,
  ],
})
export class WordLengthComponent implements OnChanges {
  @Input() word: string = '';
  wordLength: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['word'] && changes['word'].currentValue) {
      this.wordLength = this.word.length;
    }
  }
}
