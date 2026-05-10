import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message$ = new Subject<ToastMessage>();

  success(text: string) {
    this.message$.next({ text, type: 'success' });
  }

  error(text: string) {
    this.message$.next({ text, type: 'error' });
  }
}
