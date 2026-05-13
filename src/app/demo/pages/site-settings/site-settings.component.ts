import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SiteSettingsService } from 'src/app/theme/shared/service/site-settings.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

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
    'design-order-message': 'يعجبني تصميم الكارت بالكود "{id}"'
  };

  loading = true;
  saving = false;

  constructor(
    private settingsService: SiteSettingsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getAll().subscribe({
      next: (results) => {
        Object.keys(results).forEach(key => {
          this.settings[key] = results[key];
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading settings:', err);
        this.toastService.error('Failed to load settings');
        this.loading = false;
      }
    });
  }

  saveSetting(key: string): void {
    this.saving = true;
    this.settingsService.set(key, this.settings[key]).subscribe({
      next: () => {
        this.toastService.success(`${key.replace(/-/g, ' ')} updated successfully`);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving setting:', err);
        this.toastService.error(`Failed to update ${key}`);
        this.saving = false;
      }
    });
  }

  saveAll(): void {
    this.saving = true;
    this.settingsService.setBatch(this.settings).subscribe({
      next: () => {
        this.toastService.success('All settings saved successfully');
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving all settings:', err);
        this.toastService.error('Failed to save settings');
        this.saving = false;
      }
    });
  }
}
