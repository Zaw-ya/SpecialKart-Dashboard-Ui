import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ContactService, ContactMessage } from 'src/app/theme/shared/service/contact.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

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
  filterStatus: 'all' | 'read' | 'unread' = 'all';

  constructor(
    private contactService: ContactService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get unreadCount(): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  get filteredMessages(): ContactMessage[] {
    return this.messages.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        m.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.phoneNumber.includes(this.searchTerm);
      
      const matchesFilter = 
        this.filterStatus === 'all' || 
        (this.filterStatus === 'read' && m.isRead) || 
        (this.filterStatus === 'unread' && !m.isRead);
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  ngOnInit(): void {
    this.loadData();
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
