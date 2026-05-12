import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventTypeService, EventType } from 'src/app/theme/shared/service/event-type.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-event-types',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './event-types.component.html',
  styleUrl: './event-types.component.scss'
})
export class EventTypesComponent implements OnInit {
  eventTypes: EventType[] = [];
  loading = true;
  error = '';
  
  // For Create/Edit
  showForm = false;
  editingEventType: EventType | null = null;
  eventTypeName = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  submitting = false;
  searchTerm = '';

  constructor(
    private eventTypeService: EventTypeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredEventTypes(): EventType[] {
    return this.eventTypes.filter(t => 
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.loadEventTypes();
  }

  loadEventTypes(silent = false): void {
    if (!silent) this.loading = true;
    this.eventTypeService.getAll().subscribe({
      next: (data) => {
        this.eventTypes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load event types';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  addEventType(): void {
    this.editingEventType = null;
    this.eventTypeName = '';
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  editEventType(eventType: EventType): void {
    this.editingEventType = eventType;
    this.eventTypeName = eventType.name;
    this.selectedFile = null;
    this.imagePreview = eventType.imageUrl;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingEventType = null;
    this.eventTypeName = '';
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveEventType(): void {
    if (!this.eventTypeName.trim()) return;
    if (!this.editingEventType && !this.selectedFile) {
      this.toastService.error('Please select an image');
      return;
    }
    
    this.submitting = true;
    const formData = new FormData();
    formData.append('Name', this.eventTypeName);
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }
    
    const request = this.editingEventType 
      ? this.eventTypeService.update(this.editingEventType.id, formData)
      : this.eventTypeService.create(formData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Event type saved successfully!');
        this.eventTypeService.clearCache();
        this.loadEventTypes(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save event type: ${detail}`);
      }
    });
  }

  deleteEventType(id: number): void {
    if (confirm('Are you sure? This might affect invitation cards linked to this event type.')) {
      this.eventTypeService.delete(id).subscribe({
        next: () => {
          this.eventTypeService.clearCache();
          this.loadEventTypes();
        },
        error: () => alert('Failed to delete event type')
      });
    }
  }
}
