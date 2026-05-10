import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationCardService, InvitationCard } from 'src/app/theme/shared/service/invitation-card.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EventTypeService, EventType } from 'src/app/theme/shared/service/event-type.service';
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
    imageUrl: '',
    isVisible: true,
    inCarousel: false,
    rating: 5,
    eventTypeIds: [] as number[]
  };

  constructor(
    private invitationCardService: InvitationCardService,
    private eventTypeService: EventTypeService
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
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load data';
        this.loading = false;
      }
    });
  }

  addCard(): void {
    this.editingCard = null;
    this.cardData = {
      title: '',
      gender: 0,
      price: 0,
      imageUrl: '',
      isVisible: true,
      inCarousel: false,
      rating: 5,
      eventTypeIds: []
    };
    this.showForm = true;
  }

  editCard(card: InvitationCard): void {
    this.editingCard = card;
    this.cardData = {
      title: card.title,
      gender: Number(card.gender),
      price: card.price,
      imageUrl: card.imageUrl,
      isVisible: card.isVisible,
      inCarousel: card.inCarousel,
      rating: card.rating,
      eventTypeIds: card.eventTypeIds || []
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCard = null;
  }

  saveCard(): void {
    this.submitting = true;
    console.log('Saving card:', this.cardData);
    
    const request = this.editingCard
      ? this.invitationCardService.update(this.editingCard.id, this.cardData)
      : this.invitationCardService.create(this.cardData);

    request.subscribe({
      next: () => {
        this.invitationCardService.clearCache();
        this.loadData(true);
        this.cancelForm();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error saving card:', err);
        alert('Failed to save card: ' + (err.error?.message || err.message));
        this.submitting = false;
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
    const updatedCard = { ...card, isVisible: !card.isVisible };
    console.log('Toggling visibility for card:', card.id);
    this.invitationCardService.update(card.id, updatedCard).subscribe({
      next: () => {
        card.isVisible = updatedCard.isVisible;
        console.log('Visibility updated successfully');
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        alert('Failed to update visibility: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleCarousel(card: InvitationCard): void {
    const updatedCard = { ...card, inCarousel: !card.inCarousel };
    console.log('Toggling carousel for card:', card.id);
    this.invitationCardService.update(card.id, updatedCard).subscribe({
      next: () => {
        card.inCarousel = updatedCard.inCarousel;
        console.log('Carousel updated successfully');
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
