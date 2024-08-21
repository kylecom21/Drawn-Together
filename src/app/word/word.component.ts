import { Component, OnInit } from '@angular/core';
import { Word } from '../../../api';

@Component({
  selector: 'app-word',
  standalone: true,
  imports: [],
  template: `<div class="word">
    <div class="wordOnPage">{{word}}</div>
  </div>`,
  styleUrl: './word.component.css',
})
export class WordComponent implements OnInit {
  data: any;

  constructor(public word: Word){}

  ngOnInit(): void {
    this.word.getWord().subscribe(response => {
      this.word = response.word
    })
  }
}
