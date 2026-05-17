import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SiteSettingsService } from 'src/app/theme/shared/service/site-settings.service';
import { InvitationCardService } from 'src/app/theme/shared/service/invitation-card.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './site-settings.component.html',
  styleUrl: './site-settings.component.scss'
})
export class SiteSettingsComponent implements OnInit {
  settings: { [key: string]: string } = {
    'site-name': 'SpecialKart',
    'contact-email': '',
    'contact-phone': '',
    'whatsapp-number': '',
    'facebook-url': '',
    'instagram-url': '',
    'address': '',
    'design-order-message': 'يعجبني تصميم الكارت بالكود "{id}"',
    'twilio-verify-sid': '',
    'twilio-otp-template-sid': '',
    'twilio-template-sid': ''
  };

  loading = true;
  saving = false;
  triggering = false;

  bulkVisibility = {
    updateGlobal: false,
    globalMinRating: 4,
    updateCarousel: false,
    carouselMinRating: 5
  };

  constructor(
    private settingsService: SiteSettingsService,
    private invitationCardService: InvitationCardService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    
    // Safety timeout: if request takes too long or hangs, release the view
    const safetyTimer = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 8000);

    this.settingsService.getAll().pipe(
      finalize(() => {
        this.loading = false;
        clearTimeout(safetyTimer);
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (results) => {
        if (results) {
          Object.keys(results).forEach(key => {
            this.settings[key] = results[key];
          });
        }
      },
      error: (err) => {
        console.error('Error loading settings:', err);
        this.toastService.error('Failed to load settings');
      }
    });
  }

  saveSetting(key: string): void {
    this.saving = true;
    this.settingsService.set(key, this.settings[key]).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(`${key.replace(/-/g, ' ')} updated successfully`);
      },
      error: (err) => {
        console.error('Error saving setting:', err);
        this.toastService.error(`Failed to update ${key}`);
      }
    });
  }

  saveAll(): void {
    this.saving = true;
    this.settingsService.setBatch(this.settings).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success('All settings saved successfully');
      },
      error: (err) => {
        console.error('Error saving all settings:', err);
        this.toastService.error('Failed to save settings');
      }
    });
  }

  applyBulkVisibility(): void {
    if (!this.bulkVisibility.updateGlobal && !this.bulkVisibility.updateCarousel) {
      this.toastService.warning('Please select at least one action (toggle the switches ON)');
      return;
    }

    // Constraint: Carousel rating cannot be lower than Global rating if both are updated
    if (this.bulkVisibility.updateGlobal && this.bulkVisibility.updateCarousel) {
      if (this.bulkVisibility.carouselMinRating < this.bulkVisibility.globalMinRating) {
        this.toastService.warning('Carousel threshold cannot be lower than Global Visibility threshold.');
        return;
      }
    }

    if (confirm('Are you sure you want to trigger this bulk update? This will overwrite visibility states for matching cards.')) {
      this.triggering = true;
      this.invitationCardService.triggerBulkVisibility(this.bulkVisibility).pipe(
        finalize(() => {
          this.triggering = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (res) => {
          const count = res?.count ?? 0;
          this.toastService.success(`Bulk update applied. ${count} cards were updated.`);
          
          // Reset switches to avoid accidental double triggers
          this.bulkVisibility.updateGlobal = false;
          this.bulkVisibility.updateCarousel = false;
        },
        error: (err) => {
          console.error('Error triggering bulk visibility:', err);
          this.toastService.error('Failed to trigger bulk visibility update');
        }
      });
    }
  }
}
