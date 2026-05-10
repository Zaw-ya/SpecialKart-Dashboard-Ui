import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryService, Country } from 'src/app/theme/shared/service/country.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent implements OnInit {
  countries: Country[] = [];
  loading = true;
  error = '';
  
  // For Create/Edit
  showForm = false;
  editingCountry: Country | null = null;
  countryName = '';
  submitting = false;

  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(silent = false): void {
    if (!silent) this.loading = true;
    console.log('Loading countries...');
    this.countryService.getAll().subscribe({
      next: (data) => {
        this.countries = data;
        this.loading = false;
        console.log('Countries loaded:', data);
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        this.error = 'Failed to load countries';
        this.loading = false;
      }
    });
  }

  addCountry(): void {
    this.editingCountry = null;
    this.countryName = '';
    this.showForm = true;
  }

  editCountry(country: Country): void {
    this.editingCountry = country;
    this.countryName = country.name;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCountry = null;
    this.countryName = '';
  }

  saveCountry(): void {
    if (!this.countryName.trim()) return;
    
    this.submitting = true;
    console.log('Saving country:', this.countryName);
    
    const request = this.editingCountry 
      ? this.countryService.update(this.editingCountry.id, { name: this.countryName })
      : this.countryService.create({ name: this.countryName });

    request.subscribe({
      next: (res) => {
        console.log('Save success:', res);
        this.countryService.clearCache();
        this.loadCountries(true); // Silent refresh
        this.cancelForm();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Save error:', err);
        alert('Failed to save country: ' + (err.error?.message || err.message));
        this.submitting = false;
      }
    });
  }


  deleteCountry(id: number): void {
    if (confirm('Are you sure? This might affect cities linked to this country.')) {
      this.countryService.delete(id).subscribe({
        next: () => {
          this.countryService.clearCache();
          this.loadCountries();
        },
        error: () => alert('Failed to delete country')
      });
    }
  }
}
