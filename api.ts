import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Word {
  baseURL: string = 'https://drawntogether-backend.onrender.com/api/word';

  constructor(private http: HttpClient) {}

  getWord(): Observable<any> {
    return this.http.get(this.baseURL);
  }
}
