import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TestimonialService, Testimonial } from 'src/app/theme/shared/service/testimonial.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  loading = true;
  error = '';
  
  showForm = false;
  submitting = false;
  editingTestimonial: Testimonial | null = null;
  testimonialData = {
    name: '',
    role: '',
    content: '',
    rating: 5,
    isVisible: true
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private testimonialService: TestimonialService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    this.testimonialService.getAll().subscribe({
      next: (res) => {
        this.testimonials = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading testimonials:', err);
        this.error = 'Failed to load testimonials';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addTestimonial(): void {
    this.editingTestimonial = null;
    this.testimonialData = {
      name: '',
      role: '',
      content: '',
      rating: 5,
      isVisible: true
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  editTestimonial(testimonial: Testimonial): void {
    this.editingTestimonial = testimonial;
    this.testimonialData = {
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      isVisible: testimonial.isVisible
    };
    this.selectedFile = null;
    this.imagePreview = testimonial.imageUrl;
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
    this.editingTestimonial = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveTestimonial(): void {
    this.submitting = true;
    
    const formData = new FormData();
    formData.append('Name', this.testimonialData.name);
    formData.append('Role', this.testimonialData.role);
    formData.append('Content', this.testimonialData.content);
    formData.append('Rating', this.testimonialData.rating.toString());
    formData.append('IsVisible', this.testimonialData.isVisible.toString());

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const request = this.editingTestimonial
      ? this.testimonialService.update(this.editingTestimonial.id, formData)
      : this.testimonialService.create(formData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Testimonial saved successfully!');
        this.testimonialService.clearCache();
        this.loadData(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save testimonial: ${detail}`);
      }
    });
  }

  deleteTestimonial(id: number): void {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      this.testimonialService.delete(id).subscribe({
        next: () => {
          this.testimonialService.clearCache();
          this.testimonials = this.testimonials.filter((t) => t.id !== id);
          this.toastService.success('Testimonial deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting testimonial:', err);
          this.toastService.error('Failed to delete testimonial');
        }
      });
    }
  }

  toggleVisibility(testimonial: Testimonial): void {
    const formData = new FormData();
    formData.append('Name', testimonial.name);
    formData.append('Role', testimonial.role);
    formData.append('Content', testimonial.content);
    formData.append('Rating', testimonial.rating.toString());
    formData.append('IsVisible', (!testimonial.isVisible).toString());

    this.testimonialService.update(testimonial.id, formData).subscribe({
      next: () => {
        testimonial.isVisible = !testimonial.isVisible;
        this.testimonialService.clearCache();
        this.toastService.success(testimonial.isVisible ? 'Testimonial visible' : 'Testimonial hidden');
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        this.toastService.error('Failed to update status');
      }
    });
  }
}
