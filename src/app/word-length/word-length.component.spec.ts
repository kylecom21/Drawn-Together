import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordLengthComponent } from './word-length.component';

describe('WordLengthComponent', () => {
  let component: WordLengthComponent;
  let fixture: ComponentFixture<WordLengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordLengthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordLengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
