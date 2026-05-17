import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DemoRequestsService, DemoRequest } from 'src/app/theme/shared/service/demo-requests.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-demo-requests',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './demo-requests.component.html'
})
export class DemoRequestsComponent implements OnInit {
  requests: DemoRequest[] = [];
  loading = true;

  get verified() { return this.requests.filter(r => r.isVerified).length; }
  get pending() { return this.requests.filter(r => !r.isVerified).length; }

  constructor(
    private service: DemoRequestsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getAll().pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => this.requests = data,
        error: () => this.toastService.error('Failed to load demo requests')
      });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('ar-EG');
  }

  openWhatsApp(number: string) {
    const clean = number.replace('+', '');
    window.open(`https://wa.me/${clean}`, '_blank');
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }
}
