import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DemoRequestsService, DemoRequest } from 'src/app/theme/shared/service/demo-requests.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { MetaLeadEventsService, MetaRecordStatus } from 'src/app/theme/shared/service/meta-lead-events.service';
import { InvitationCardService, InvitationCard } from 'src/app/theme/shared/service/invitation-card.service';
import { AuthService } from 'src/app/theme/shared/service/auth.service';
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

  /** Manual send: delivers the demo to a number that never went through the site. */
  manualSend: { whatsAppNumber: string; name: string; invitationCardId: number | null } = {
    whatsAppNumber: '',
    name: '',
    invitationCardId: null
  };
  sendingManual = false;
  cards: InvitationCard[] = [];

  constructor(
    private service: DemoRequestsService,
    private metaService: MetaLeadEventsService,
    private cardService: InvitationCardService,
    private toastService: ToastService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get canViewMetaTracking(): boolean {
    return this.authService.hasRole(['Admin', 'Marketer']);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.highlightId = params['highlight'] ? Number(params['highlight']) : null;
    });
    this.load();
    if (this.canViewMetaTracking) {
      this.loadMetaStatuses();
    }
    this.loadCards();
  }

  /** Cards offered in the manual-send picker; failing to load just leaves the default option. */
  loadCards(): void {
    this.cardService.getAll().subscribe({
      next: (data) => {
        this.cards = data;
        this.cdr.detectChanges();
      },
      error: () => (this.cards = [])
    });
  }

  /** Sends the demo card to a number typed by the admin, skipping the OTP flow. */
  sendToNumber(): void {
    const number = (this.manualSend.whatsAppNumber || '').trim();
    if (!number) return;

    if (!confirm(`إرسال كارت التجربة المجانية إلى ${number}؟`)) return;

    this.sendingManual = true;
    this.service
      .adminResend({
        whatsAppNumber: number,
        name: this.manualSend.name?.trim() || null,
        invitationCardId: this.manualSend.invitationCardId
      })
      .pipe(finalize(() => { this.sendingManual = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          this.toastService.success(res?.message || 'تم إرسال الكارت بنجاح');
          this.manualSend = { whatsAppNumber: '', name: '', invitationCardId: null };
          this.load();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'فشل إرسال الكارت')
      });
  }

  /** Delivery status of the Meta Lead event for each demo request (optional column). */
  loadMetaStatuses(): void {
    if (!this.canViewMetaTracking) return;
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

  /** ids with an admin action in flight, so only that row's buttons get disabled */
  resendingIds = new Set<number>();
  resettingIds = new Set<number>();

  isResending(id: number): boolean {
    return this.resendingIds.has(id);
  }

  isResetting(id: number): boolean {
    return this.resettingIds.has(id);
  }

  /** Re-sends the same demo card to the customer without asking for a new OTP. */
  resend(r: DemoRequest): void {
    if (!confirm(`إعادة إرسال كارت التجربة المجانية إلى ${r.whatsAppNumber}؟`)) return;

    this.resendingIds.add(r.id);
    this.service
      .adminResend({
        whatsAppNumber: r.whatsAppNumber,
        name: r.name,
        invitationCardId: r.invitationCardId,
        eventType: r.eventType,
        category: r.category
      })
      .pipe(finalize(() => { this.resendingIds.delete(r.id); this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          this.toastService.success(res?.message || 'تم إعادة إرسال الكارت بنجاح');
          this.load();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'فشل إعادة إرسال الكارت')
      });
  }

  /** Clears the free-trial lock so this number can request the demo again from the site. */
  reset(r: DemoRequest): void {
    if (!confirm(`السماح للرقم ${r.whatsAppNumber} بطلب التجربة المجانية من جديد؟`)) return;

    this.resettingIds.add(r.id);
    this.service
      .adminReset(r.whatsAppNumber)
      .pipe(finalize(() => { this.resettingIds.delete(r.id); this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          this.toastService.success(res?.message || 'تم فتح التجربة المجانية لهذا الرقم');
          this.load();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'فشل إعادة فتح التجربة المجانية')
      });
  }
}
