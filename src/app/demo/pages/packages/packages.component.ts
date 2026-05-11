import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PackageService, Package, PackagePricingTier } from 'src/app/theme/shared/service/package.service';
import { FeatureService, Feature } from 'src/app/theme/shared/service/feature.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './packages.component.html',
  styleUrl: './packages.component.scss'
})
export class PackagesComponent implements OnInit {
  packages: Package[] = [];
  allFeatures: Feature[] = [];
  loading = true;
  error = '';
  
  showForm = false;
  submitting = false;
  editingPackage: Package | null = null;
  packageData: any = {
    name: '',
    description: '',
    compensationPercentage: 0,
    isPopular: false,
    isActive: true,
    featureIds: [] as number[],
    pricingTiers: [] as PackagePricingTier[]
  };

  constructor(
    private packageService: PackageService,
    private featureService: FeatureService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  getFeatureDescription(id: number): string {
    return this.allFeatures.find(f => f.id === id)?.description || 'Feature';
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    forkJoin({
      packages: this.packageService.getAll(),
      features: this.featureService.getAll()
    }).subscribe({
      next: (res) => {
        this.packages = res.packages;
        this.allFeatures = res.features;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading packages data:', err);
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addPackage(): void {
    this.editingPackage = null;
    this.packageData = {
      name: '',
      description: '',
      compensationPercentage: 0,
      isPopular: false,
      isActive: true,
      featureIds: [],
      pricingTiers: []
    };
    this.showForm = true;
  }

  editPackage(pkg: Package): void {
    this.editingPackage = pkg;
    this.packageData = {
      name: pkg.name,
      description: pkg.description,
      compensationPercentage: pkg.compensationPercentage,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      featureIds: pkg.featureIds || [],
      pricingTiers: JSON.parse(JSON.stringify(pkg.pricingTiers || [])) // Deep clone
    };
    this.showForm = true;
  }

  addPricingTier(): void {
    this.packageData.pricingTiers.push({
      minInvitations: 0,
      maxInvitations: 0,
      price: 0
    });
  }

  removePricingTier(index: number): void {
    this.packageData.pricingTiers.splice(index, 1);
  }

  toggleFeature(featureId: number): void {
    const index = this.packageData.featureIds.indexOf(featureId);
    if (index > -1) {
      this.packageData.featureIds.splice(index, 1);
    } else {
      this.packageData.featureIds.push(featureId);
    }
  }

  isFeatureSelected(featureId: number): boolean {
    return this.packageData.featureIds.includes(featureId);
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingPackage = null;
  }

  savePackage(): void {
    this.submitting = true;
    const request = this.editingPackage
      ? this.packageService.update(this.editingPackage.id, this.packageData)
      : this.packageService.create(this.packageData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Package saved successfully!');
        this.packageService.clearCache();
        this.loadData(true);
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error('Failed to save package');
      }
    });
  }

  deletePackage(id: number): void {
    if (confirm('Are you sure you want to delete this package?')) {
      this.packageService.delete(id).subscribe({
        next: () => {
          this.packageService.clearCache();
          this.packages = this.packages.filter(p => p.id !== id);
          this.toastService.success('Package deleted');
        },
        error: () => this.toastService.error('Failed to delete package')
      });
    }
  }

  toggleActive(pkg: Package): void {
    this.packageService.toggleActive(pkg.id).subscribe({
      next: () => {
        pkg.isActive = !pkg.isActive;
        this.packageService.clearCache();
        this.toastService.success(pkg.isActive ? 'Package activated' : 'Package deactivated');
      },
      error: () => this.toastService.error('Failed to update package status')
    });
  }
}
