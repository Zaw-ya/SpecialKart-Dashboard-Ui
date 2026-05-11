import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationCardService, InvitationCard } from 'src/app/theme/shared/service/invitation-card.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EventTypeService, EventType } from 'src/app/theme/shared/service/event-type.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invitation-cards',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './invitation-cards.component.html',
  styleUrl: './invitation-cards.component.scss'
})
export class InvitationCardsComponent implements OnInit {
  cards: InvitationCard[] = [];
  eventTypes: EventType[] = [];
  loading = true;
  error = '';
  
  // Form properties
  showForm = false;
  submitting = false;
  editingCard: InvitationCard | null = null;
  cardData = {
    title: '',
    gender: 0,
    price: 0,
    isVisible: true,
    inCarousel: false,
    rating: 5,
    eventTypeIds: [] as number[]
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private invitationCardService: InvitationCardService,
    private eventTypeService: EventTypeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  getGenderLabel(gender: number): string {
    switch (gender) {
      case 0: return 'ذكوري';
      case 1: return 'أنثوي';
      case 2: return 'محايد';
      default: return 'غير معروف';
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    console.log('Loading invitation cards and event types...');
    
    forkJoin({
      cards: this.invitationCardService.getAll(),
      eventTypes: this.eventTypeService.getAll()
    }).subscribe({
      next: (res) => {
        this.cards = res.cards;
        this.eventTypes = res.eventTypes;
        this.loading = false;
        console.log('Data loaded successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addCard(): void {
    this.editingCard = null;
    this.cardData = {
      title: '',
      gender: 0,
      price: 0,
      isVisible: true,
      inCarousel: false,
      rating: 5,
      eventTypeIds: []
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  editCard(card: InvitationCard): void {
    this.editingCard = card;
    this.cardData = {
      title: card.title,
      gender: Number(card.gender),
      price: card.price,
      isVisible: card.isVisible,
      inCarousel: card.inCarousel,
      rating: card.rating,
      eventTypeIds: card.eventTypeIds || []
    };
    this.selectedFile = null;
    this.imagePreview = card.imageUrl;
    this.showForm = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCard = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveCard(): void {
    this.submitting = true;
    
    const formData = new FormData();
    formData.append('Title', this.cardData.title);
    formData.append('Gender', this.cardData.gender.toString());
    formData.append('Price', this.cardData.price.toString());
    formData.append('IsVisible', this.cardData.isVisible.toString());
    formData.append('InCarousel', this.cardData.inCarousel.toString());
    formData.append('Rating', this.cardData.rating.toString());

    this.cardData.eventTypeIds.forEach(id => {
      formData.append('EventTypeIds', id.toString());
    });

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const request = this.editingCard
      ? this.invitationCardService.update(this.editingCard.id, formData)
      : this.invitationCardService.create(formData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Card saved successfully!');
        this.invitationCardService.clearCache();
        this.loadData(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save card: ${detail}`);
      }
    });
  }

  deleteCard(id: number): void {
    if (confirm('Are you sure you want to delete this card?')) {
      console.log('Deleting card:', id);
      this.invitationCardService.delete(id).subscribe({
        next: () => {
          this.invitationCardService.clearCache();
          this.cards = this.cards.filter((c) => c.id !== id);
          console.log('Card deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting card:', err);
          alert('Failed to delete card: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  toggleVisibility(card: InvitationCard): void {
    const formData = new FormData();
    formData.append('Title', card.title);
    formData.append('Gender', card.gender.toString());
    formData.append('Price', card.price.toString());
    formData.append('IsVisible', (!card.isVisible).toString());
    formData.append('InCarousel', (!card.isVisible ? 'false' : card.inCarousel.toString()));
    formData.append('Rating', card.rating.toString());
    if (card.eventTypeIds) {
      card.eventTypeIds.forEach(id => formData.append('EventTypeIds', id.toString()));
    }

    this.invitationCardService.update(card.id, formData).subscribe({
      next: () => {
        card.isVisible = !card.isVisible;
        this.invitationCardService.clearCache();
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        alert('Failed to update visibility: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleCarousel(card: InvitationCard): void {
    const formData = new FormData();
    formData.append('Title', card.title);
    formData.append('Gender', card.gender.toString());
    formData.append('Price', card.price.toString());
    formData.append('IsVisible', card.isVisible.toString());
    formData.append('InCarousel', (!card.inCarousel).toString());
    formData.append('Rating', card.rating.toString());
    if (card.eventTypeIds) {
      card.eventTypeIds.forEach(id => formData.append('EventTypeIds', id.toString()));
    }

    this.invitationCardService.update(card.id, formData).subscribe({
      next: () => {
        card.inCarousel = !card.inCarousel;
        this.invitationCardService.clearCache();
      },
      error: (err) => {
        console.error('Error toggling carousel:', err);
        alert('Failed to update carousel: ' + (err.error?.message || err.message));
      }
    });
  }

  onEventTypeToggle(eventTypeId: number): void {
    const index = this.cardData.eventTypeIds.indexOf(eventTypeId);
    if (index > -1) {
      this.cardData.eventTypeIds.splice(index, 1);
    } else {
      this.cardData.eventTypeIds.push(eventTypeId);
    }
  }

  isEventTypeSelected(eventTypeId: number): boolean {
    return this.cardData.eventTypeIds.includes(eventTypeId);
  }
}
