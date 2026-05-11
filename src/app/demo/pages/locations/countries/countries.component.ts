import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryService, Country } from '../../../../theme/shared/service/country.service';
import { SharedModule } from '../../../../theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../theme/shared/service/toast.service';

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
  externalCountries: any[] = [];
  loadingExternal = false;
  countrySearch = '';
  tableSearch = '';
  flags: { [key: string]: string } = {};

  constructor(
    private countryService: CountryService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadExternalCountries();
  }

  loadExternalCountries(): void {
    this.loadingExternal = true;
    this.countryService.getExternalCountries().subscribe({
      next: (data) => {
        this.externalCountries = data
          .map((c: any) => {
            const name = c.name.common;
            this.flags[name] = c.flags?.svg || c.flags?.png || '';
            return {
              name: name,
              capital: c.capital ? c.capital[0] : '',
              flag: this.flags[name]
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        this.loadingExternal = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingExternal = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCountries(): any[] {
    if (!this.countrySearch) return this.externalCountries;
    return this.externalCountries.filter(c => 
      c.name.toLowerCase().includes(this.countrySearch.toLowerCase())
    );
  }

  get filteredTableCountries(): Country[] {
    if (!this.tableSearch) return this.countries;
    return this.countries.filter(c => 
      c.name.toLowerCase().includes(this.tableSearch.toLowerCase())
    );
  }

  loadCountries(silent = false): void {
    if (!silent) this.loading = true;
    this.countryService.getAll().subscribe({
      next: (data) => {
        this.countries = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        this.error = 'Failed to load countries';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addCountry(): void {
    this.editingCountry = null;
    this.countryName = '';
    this.countrySearch = '';
    this.showForm = true;
  }

  editCountry(country: Country): void {
    this.editingCountry = country;
    this.countryName = country.name;
    this.countrySearch = '';
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
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Country saved successfully!');
        this.countryService.clearCache();
        this.loadCountries(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save country: ${detail}`);
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
