import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible && current) {
      <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
        <div
          class="toast show align-items-center text-white border-0 shadow"
          [class.bg-success]="current.type === 'success'"
          [class.bg-danger]="current.type === 'error'"
          role="alert"
        >
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2 fw-semibold fs-6">
              @if (current.type === 'success') {
                <i class="ti ti-circle-check fs-5"></i>
              } @else {
                <i class="ti ti-alert-circle fs-5"></i>
              }
              {{ current.text }}
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="dismiss()"
            ></button>
          </div>
        </div>
      </div>
    }
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  visible = false;
  current: ToastMessage | null = null;

  private sub!: Subscription;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.message$.subscribe(msg => {
      this.current = msg;
      this.visible = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.visible = false; }, 3500);
    });
  }

  dismiss() {
    this.visible = false;
    if (this.timer) clearTimeout(this.timer);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.timer) clearTimeout(this.timer);
  }
}
