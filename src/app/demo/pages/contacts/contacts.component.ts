import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ContactService, ContactMessage } from 'src/app/theme/shared/service/contact.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { MetaLeadEventsService, MetaRecordStatus } from 'src/app/theme/shared/service/meta-lead-events.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  messages: ContactMessage[] = [];
  loading = true;
  error = '';
  selectedMessage: ContactMessage | null = null;
  searchTerm = '';
  startDate = '';
  endDate = '';
  filterStatus: 'all' | 'read' | 'unread' = 'all';
  filterType: 'all' | 'package' | 'design' = 'all';

  highlightId: number | null = null;
  metaStatuses: Record<string, MetaRecordStatus> = {};

  constructor(
    private contactService: ContactService,
    private metaService: MetaLeadEventsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get unreadCount(): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  getMessageType(m: ContactMessage): 'package' | 'design' | 'general' {
    const text = (m.message || '').toLowerCase();
    if (text.includes('باقة') || text.includes('package')) {
      return 'package';
    }
    if (text.includes('كارت') || text.includes('تصميم') || text.includes('card') || text.includes('design') || text.includes('كود')) {
      return 'design';
    }
    return 'general';
  }

  get packageMessagesCount(): number {
    return this.messages.filter(m => this.getMessageType(m) === 'package').length;
  }

  get designMessagesCount(): number {
    return this.messages.filter(m => this.getMessageType(m) === 'design').length;
  }

  get filteredMessages(): ContactMessage[] {
    const term = (this.searchTerm || '').toLowerCase().trim();
    return this.messages.filter(m => {
      const matchesSearch = !term ||
        (m.name ?? '').toLowerCase().includes(term) ||
        (m.email ?? '').toLowerCase().includes(term) ||
        (m.message ?? '').toLowerCase().includes(term) ||
        (m.phoneNumber ?? '').includes(term);

      const matchesStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'read' && m.isRead) ||
        (this.filterStatus === 'unread' && !m.isRead);

      const msgType = this.getMessageType(m);
      const matchesType =
        this.filterType === 'all' ||
        (this.filterType === 'package' && msgType === 'package') ||
        (this.filterType === 'design' && msgType === 'design');

      let matchesDate = true;
      if (m.createdAt) {
        const msgDate = new Date(m.createdAt).getTime();
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

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.filterStatus = 'all';
    this.filterType = 'all';
  }

  setCategoryFilter(type: 'all' | 'package' | 'design'): void {
    this.filterType = type;
  }

  openWhatsApp(phone: string): void {
    const clean = phone.replace('+', '').replace(/\s+/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        const t = params['type'];
        if (t === 'package' || t === 'design' || t === 'general') {
          this.filterType = t;
        }
      }
      this.highlightId = params['highlight'] ? Number(params['highlight']) : null;
    });

    this.loadData();
    this.loadMetaStatuses();
  }

  /** Delivery status of the Meta Lead event for each contact message (optional column). */
  loadMetaStatuses(): void {
    this.metaService.getStatusMap('ContactForm').subscribe({
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

  displayName(message: ContactMessage): string {
    return message.name?.trim() || message.phoneNumber;
  }

  displayInitial(message: ContactMessage): string {
    return this.displayName(message).charAt(0).toUpperCase();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    this.contactService.getAll().subscribe({
      next: (res) => {
        this.messages = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading contact messages:', err);
        this.error = 'Failed to load messages';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewMessage(message: ContactMessage): void {
    this.selectedMessage = message;
    if (!message.isRead) {
      this.contactService.updateStatus(message.id, true).subscribe({
        next: () => {
          message.isRead = true;
          this.contactService.clearCache();
        }
      });
    }
  }

  closeMessage(): void {
    this.selectedMessage = null;
  }

  deleteMessage(id: number): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.contactService.delete(id).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== id);
          if (this.selectedMessage?.id === id) this.selectedMessage = null;
          this.toastService.success('Message deleted');
          this.contactService.clearCache();
        },
        error: () => this.toastService.error('Failed to delete message')
      });
    }
  }
}
