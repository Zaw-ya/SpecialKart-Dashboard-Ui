import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { finalize } from 'rxjs';

import {
  MetaLeadEventsService,
  MetaLeadEvent,
  MetaLeadSummary,
  metaFormLabel,
  META_FORM_ROUTES
} from 'src/app/theme/shared/service/meta-lead-events.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-meta-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './meta-tracking.component.html'
})
export class MetaTrackingComponent implements OnInit {
  private service = inject(MetaLeadEventsService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // summary
  days = 30;
  summary: MetaLeadSummary | null = null;
  summaryLoading = true;

  // table
  events: MetaLeadEvent[] = [];
  total = 0;
  page = 1;
  pageSize = 50;
  loading = true;
  loadError = false;

  // filters
  sourceForm = '';
  status: '' | 'sent' | 'failed' = '';
  startDate = '';
  endDate = '';

  // error modal
  selected: MetaLeadEvent | null = null;

  formLabel = metaFormLabel;

  ngOnInit() {
    this.loadSummary();
    this.loadEvents();
  }

  reload() {
    this.loadSummary();
    this.loadEvents(1);
  }

  loadSummary() {
    this.summaryLoading = true;
    this.service
      .getSummary(this.days)
      .pipe(
        finalize(() => {
          this.summaryLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => (this.summary = data),
        error: () => this.toastService.error('تعذّر تحميل ملخّص أحداث Meta')
      });
  }

  loadEvents(page = this.page) {
    this.page = page;
    this.loading = true;
    this.loadError = false;
    this.service
      .getAll({
        sourceForm: this.sourceForm || undefined,
        sent: this.status === '' ? null : this.status === 'sent',
        from: this.startDate ? new Date(this.startDate + 'T00:00:00').toISOString() : undefined,
        to: this.endDate ? new Date(this.endDate + 'T23:59:59').toISOString() : undefined,
        page: this.page,
        pageSize: this.pageSize
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.events = res.items ?? [];
          this.total = res.total ?? 0;
        },
        error: () => {
          this.loadError = true;
          this.events = [];
          this.total = 0;
        }
      });
  }

  // when the period select changes, the summary and the table both follow it
  onDaysChange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - this.days);
    this.startDate = this.toInputDate(from);
    this.endDate = this.toInputDate(to);
    this.reload();
  }

  applyFilters() {
    this.loadEvents(1);
  }

  clearFilters() {
    this.sourceForm = '';
    this.status = '';
    this.startDate = '';
    this.endDate = '';
    this.loadEvents(1);
  }

  get hasFilters(): boolean {
    return !!(this.sourceForm || this.status || this.startDate || this.endDate);
  }

  // pagination
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pages(): number[] {
    const last = this.totalPages;
    const start = Math.max(1, Math.min(this.page - 2, last - 4));
    const end = Math.min(last, start + 4);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.loadEvents(page);
  }

  get successRate(): number {
    if (!this.summary || !this.summary.total) return 0;
    return Math.round((this.summary.sent / this.summary.total) * 100);
  }

  recordLink(e: MetaLeadEvent): string | null {
    const route = META_FORM_ROUTES[e.sourceForm];
    return route && e.sourceRecordId ? route : null;
  }

  short(value: string | null | undefined, length = 8): string {
    if (!value) return '—';
    return value.length > length ? value.slice(0, length) + '…' : value;
  }

  copy(value: string | null | undefined, label: string) {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => this.toastService.success(`تم نسخ ${label}`))
      .catch(() => this.toastService.error('تعذّر النسخ'));
  }

  openDetails(e: MetaLeadEvent) {
    this.selected = e;
  }

  closeDetails() {
    this.selected = null;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('ar-EG');
  }

  private toInputDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
