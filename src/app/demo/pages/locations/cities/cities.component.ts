import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityService, City } from 'src/app/theme/shared/service/city.service';
import { CountryService, Country } from 'src/app/theme/shared/service/country.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss'
})
export class CitiesComponent implements OnInit {
  cities: City[] = [];
  countries: Country[] = [];
  loading = true;
  error = '';
  
  // For Create/Edit
  showForm = false;
  editingCity: City | null = null;
  cityName = '';
  selectedCountryId: number | null = null;
  submitting = false;

  constructor(
    private cityService: CityService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    console.log('Loading cities and countries...');
    
    forkJoin({
      countries: this.countryService.getAll(),
      cities: this.cityService.getAll()
    }).subscribe({
      next: (data) => {
        this.countries = data.countries;
        this.cities = data.cities;
        this.loading = false;
        console.log('Cities and countries loaded successfully');
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load data';
        this.loading = false;
      }
    });
  }

  addCity(): void {
    this.editingCity = null;
    this.cityName = '';
    this.selectedCountryId = this.countries.length > 0 ? this.countries[0].id : null;
    this.showForm = true;
  }

  editCity(city: City): void {
    this.editingCity = city;
    this.cityName = city.name;
    this.selectedCountryId = city.countryId;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCity = null;
    this.cityName = '';
    this.selectedCountryId = null;
  }

  saveCity(): void {
    if (!this.cityName.trim() || !this.selectedCountryId) return;
    
    this.submitting = true;
    const cityData = { name: this.cityName, countryId: Number(this.selectedCountryId) };
    console.log('Saving city:', cityData);
    
    const request = this.editingCity
      ? this.cityService.update(this.editingCity.id, cityData)
      : this.cityService.create(cityData);

    request.subscribe({
      next: (res) => {
        console.log('Save success:', res);
        this.loadData(true); // Silent refresh
        this.cancelForm();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Save error:', err);
        alert('Failed to save city: ' + (err.error?.message || err.message));
        this.submitting = false;
      }
    });
  }


  deleteCity(id: number): void {
    if (confirm('Are you sure?')) {
      this.cityService.delete(id).subscribe({
        next: () => this.loadData(),
        error: () => alert('Failed to delete city')
      });
    }
  }

  getCountryName(id: number): string {
    return this.countries.find(c => c.id === id)?.name || 'Unknown';
  }
}
