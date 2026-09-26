import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SiteSettingsService } from 'src/app/theme/shared/service/site-settings.service';
import { InvitationCardService } from 'src/app/theme/shared/service/invitation-card.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { DemoRequestsService, MAX_DEMO_CARD_IMAGE_BYTES } from 'src/app/theme/shared/service/demo-requests.service';
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
    'twilio-account-sid': '',
    'twilio-auth-token': '',
    'twilio-whatsapp-from': '',
    'twilio-verify-sid': '',
    'twilio-otp-template-sid': '',
    'demo-default-image-url': '',
    'twilio-template-sid': '',
    'demo-contact-phone': ''
  };

  loading = true;
  saving = false;
  triggering = false;
  uploadingCardImage = false;
  cardImageSizeLabel = '';

  // Tab & UI state
  activeTab: 'general' | 'social' | 'twilio' | 'demo' | 'bulk' = 'general';
  showAuthToken = false;
  copiedField: string | null = null;
  searchQuery = '';
  previewOrderId = 'CRD-108';

  readonly tabs = [
    { id: 'general', label: 'العامة والهوية', labelEn: 'General & Brand', icon: 'ti-settings', badge: null },
    { id: 'social', label: 'التواصل والشبكات', labelEn: 'Channels & Social', icon: 'ti-share', badge: null },
    { id: 'twilio', label: 'بوابة Twilio و OTP', labelEn: 'Twilio & WhatsApp API', icon: 'ti-plug', badge: 'api' },
    { id: 'demo', label: 'إعدادات بطاقة الديمو', labelEn: 'Demo Card Flow', icon: 'ti-photo', badge: null },
    { id: 'bulk', label: 'عمليات التحديث الشامل', labelEn: 'Bulk Operations', icon: 'ti-bolt', badge: 'tool' }
  ] as const;

  /**
   * The prefix to hard-code into the WhatsApp template's Media URL. Derived from
   * the uploaded image so it always shows the host the API actually serves from,
   * rather than one guessed here.
   */
  get cardImageBaseUrl(): string {
    const url = this.settings['demo-default-image-url'] ?? '';
    const marker = '/demo-cards/';
    const index = url.indexOf(marker);
    return index >= 0 ? url.slice(0, index + marker.length) : '<api-host>/demo-cards/';
  }

  get isTwilioConfigured(): boolean {
    return !!(
      this.settings['twilio-account-sid'] &&
      this.settings['twilio-whatsapp-from'] &&
      this.settings['twilio-verify-sid']
    );
  }

  get isDemoConfigured(): boolean {
    return !!(
      this.settings['demo-default-image-url'] &&
      this.settings['twilio-template-sid']
    );
  }

  get orderMessagePreview(): string {
    const template = this.settings['design-order-message'] || 'يعجبني تصميم الكارت بالكود "{id}"';
    return template.replace(/\{id\}/g, this.previewOrderId);
  }

  get whatsAppTestLink(): string {
    const raw = (this.settings['whatsapp-number'] || '').replace(/\D/g, '');
    return raw ? `https://wa.me/${raw}` : '';
  }

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
    private demoService: DemoRequestsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  selectTab(tab: 'general' | 'social' | 'twilio' | 'demo' | 'bulk'): void {
    this.activeTab = tab;
  }

  toggleAuthToken(): void {
    this.showAuthToken = !this.showAuthToken;
  }

  copyToClipboard(text: string, fieldName: string): void {
    if (!text) {
      this.toastService.warning('لا يوجد نص لنسخه');
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedField = fieldName;
        this.toastService.success(`تم نسخ ${fieldName} للحافظة`);
        setTimeout(() => {
          if (this.copiedField === fieldName) {
            this.copiedField = null;
            this.cdr.detectChanges();
          }
        }, 2000);
      }).catch(() => {
        this.toastService.error('تعذر النسخ تلقائياً');
      });
    }
  }

  /**
   * Uploads the demo card image to the API's wwwroot. The API stores the public
   * URL as `demo-default-image-url` itself, so the field is refreshed from the
   * response rather than saved again from here.
   */
  onCardImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Checked here too so an oversized file is rejected instantly instead of
    // after a long upload that the server would refuse anyway.
    if (file.size > MAX_DEMO_CARD_IMAGE_BYTES) {
      this.toastService.error(
        `حجم الصورة ${(file.size / 1024 / 1024).toFixed(1)} ميجا. الحد الأقصى 5 ميجا، اضغط الصورة وحاول تاني.`
      );
      input.value = '';
      return;
    }

    this.uploadingCardImage = true;
    this.demoService.uploadCardImage(file).pipe(
      finalize(() => {
        this.uploadingCardImage = false;
        input.value = '';
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (result) => {
        this.settings['demo-default-image-url'] = result.url;
        this.cardImageSizeLabel = `${(result.sizeBytes / 1024).toFixed(0)} KB`;
        this.toastService.success('تم رفع صورة الكارت وحفظها');
      },
      error: (err) => {
        console.error('Error uploading demo card image:', err);
        this.toastService.error(err?.error?.message ?? 'فشل رفع صورة الكارت');
      }
    });
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

  saveSection(keys: string[], sectionName: string): void {
    const payload: { [key: string]: string } = {};
    keys.forEach(k => {
      payload[k] = this.settings[k];
    });

    this.saving = true;
    this.settingsService.setBatch(payload).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.toastService.success(`تم حفظ إعدادات ${sectionName} بنجاح`);
      },
      error: (err) => {
        console.error(`Error saving ${sectionName} settings:`, err);
        this.toastService.error(`فشل حفظ إعدادات ${sectionName}`);
      }
    });
  }

  onSearchChange(): void {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return;

    if (q.includes('twilio') || q.includes('token') || q.includes('sid') || q.includes('otp') || q.includes('تويليو')) {
      this.activeTab = 'twilio';
    } else if (q.includes('demo') || q.includes('كارت') || q.includes('صورة') || q.includes('card') || q.includes('image')) {
      this.activeTab = 'demo';
    } else if (q.includes('whats') || q.includes('face') || q.includes('insta') || q.includes('واتس') || q.includes('انستا') || q.includes('فيسبوك') || q.includes('رسالة') || q.includes('message')) {
      this.activeTab = 'social';
    } else if (q.includes('bulk') || q.includes('star') || q.includes('rating') || q.includes('carousel') || q.includes('شامل') || q.includes('تقييم') || q.includes('سلايدر')) {
      this.activeTab = 'bulk';
    } else if (q.includes('name') || q.includes('email') || q.includes('phone') || q.includes('address') || q.includes('موقع') || q.includes('ايميل') || q.includes('عنوان') || q.includes('هاتف')) {
      this.activeTab = 'general';
    }
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
