import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorService, Supervisor } from 'src/app/theme/shared/service/supervisor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.scss'
})
export class SupervisorsComponent implements OnInit {
  supervisors: Supervisor[] = [];
  loading = true;
  error = '';
  
  showForm = false;
  editingSupervisor: Supervisor | null = null;
  supervisorData = {
    name: '',
    nickname: '',
    rating: 5,
    isVisible: true
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  submitting = false;

  constructor(
    private supervisorService: SupervisorService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSupervisors();
  }

  loadSupervisors(silent = false): void {
    if (!silent) this.loading = true;
    this.supervisorService.getAll().subscribe({
      next: (data) => {
        this.supervisors = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load supervisors';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addSupervisor(): void {
    this.editingSupervisor = null;
    this.supervisorData = {
      name: '',
      nickname: '',
      rating: 5,
      isVisible: true
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  editSupervisor(supervisor: Supervisor): void {
    this.editingSupervisor = supervisor;
    this.supervisorData = {
      name: supervisor.name,
      nickname: supervisor.nickname,
      rating: supervisor.rating,
      isVisible: supervisor.isVisible
    };
    this.selectedFile = null;
    this.imagePreview = supervisor.imageUrl;
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
    this.editingSupervisor = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveSupervisor(): void {
    if (!this.supervisorData.name.trim()) return;
    this.submitting = true;
    
    const formData = new FormData();
    formData.append('Name', this.supervisorData.name);
    formData.append('Nickname', this.supervisorData.nickname);
    formData.append('Rating', this.supervisorData.rating.toString());
    formData.append('IsVisible', this.supervisorData.isVisible.toString());

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }
    
    const request = this.editingSupervisor 
      ? this.supervisorService.update(this.editingSupervisor.id, formData)
      : this.supervisorService.create(formData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Supervisor saved successfully!');
        this.supervisorService.clearCache();
        this.loadSupervisors(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save supervisor: ${detail}`);
      }
    });
  }

  deleteSupervisor(id: number): void {
    if (confirm('Are you sure?')) {
      this.supervisorService.delete(id).subscribe({
        next: () => {
          this.supervisorService.clearCache();
          this.supervisors = this.supervisors.filter(s => s.id !== id);
        },
        error: () => alert('Failed to delete supervisor')
      });
    }
  }
}
