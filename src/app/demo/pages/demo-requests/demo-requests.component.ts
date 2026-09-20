import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DemoRequestsService, DemoRequest } from 'src/app/theme/shared/service/demo-requests.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { MetaLeadEventsService, MetaRecordStatus } from 'src/app/theme/shared/service/meta-lead-events.service';
import { ActivatedRoute } from '@angular/router';
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
  searchTerm = '';
  startDate = '';
  endDate = '';

  get verified() { return this.requests.filter(r => r.isVerified).length; }
  get pending() { return this.requests.filter(r => !r.isVerified).length; }

  get filteredRequests(): DemoRequest[] {
    const term = (this.searchTerm || '').toLowerCase().trim();
    return this.requests.filter(r => {
      const matchesSearch = !term ||
        (r.name ?? '').toLowerCase().includes(term) ||
        (r.whatsAppNumber ?? '').includes(term) ||
        (r.eventType ?? '').toLowerCase().includes(term) ||
        (r.category ?? '').toLowerCase().includes(term);

      let matchesDate = true;
      if (r.createdAt) {
        const msgDate = new Date(r.createdAt).getTime();
        if (this.startDate) {
          const start = new Date(this.startDate);
          start.setHours(0, 0, 0, 0);
          if (msgDate < start.getTime()) matchesDate = false;
        }
        if (this.endDate) {
          const end = new Date(this.endDate);
          end.setHours(23, 59, 59, 999);
          if (msgDate > end.getTime()) matchesDate = false;
        }
      }

      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
  }

  highlightId: number | null = null;
  metaStatuses: Record<string, MetaRecordStatus> = {};

  constructor(
    private service: DemoRequestsService,
    private metaService: MetaLeadEventsService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.highlightId = params['highlight'] ? Number(params['highlight']) : null;
    });
    this.load();
    this.loadMetaStatuses();
  }

  /** Delivery status of the Meta Lead event for each demo request (optional column). */
  loadMetaStatuses(): void {
    this.metaService.getStatusMap('DemoRequestForm').subscribe({
      next: (map) => {
        this.metaStatuses = map;
        this.cdr.detectChanges();
      },
      error: () => (this.metaStatuses = {})
    });
  }

  metaStatus(id: number): MetaRecordStatus {
    return this.metaStatuses[String(id)] ?? 'none';
  }

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
