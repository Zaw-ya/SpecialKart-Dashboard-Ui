import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureService, Feature } from 'src/app/theme/shared/service/feature.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent implements OnInit {
  features: Feature[] = [];
  loading = true;
  error = '';
  
  showForm = false;
  editingFeature: Feature | null = null;
  featureDescription = '';
  submitting = false;

  constructor(
    private featureService: FeatureService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeatures();
  }

  loadFeatures(silent = false): void {
    if (!silent) this.loading = true;
    this.featureService.getAll().subscribe({
      next: (data) => {
        this.features = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load features';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addFeature(): void {
    this.editingFeature = null;
    this.featureDescription = '';
    this.showForm = true;
  }

  editFeature(feature: Feature): void {
    this.editingFeature = feature;
    this.featureDescription = feature.description;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingFeature = null;
  }

  saveFeature(): void {
    if (!this.featureDescription.trim()) return;
    this.submitting = true;
    
    const request = this.editingFeature 
      ? this.featureService.update(this.editingFeature.id, { description: this.featureDescription })
      : this.featureService.create({ description: this.featureDescription });

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Feature saved successfully!');
        this.featureService.clearCache();
        this.loadFeatures(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save feature: ${detail}`);
      }
    });
  }

  deleteFeature(id: number): void {
    if (confirm('Are you sure?')) {
      this.featureService.delete(id).subscribe({
        next: () => {
          this.featureService.clearCache();
          this.features = this.features.filter(f => f.id !== id);
        },
        error: () => alert('Failed to delete feature')
      });
    }
  }
}
