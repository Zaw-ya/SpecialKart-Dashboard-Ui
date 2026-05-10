import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorService, Supervisor } from 'src/app/theme/shared/service/supervisor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';

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
    imageUrl: '',
    rating: 5,
    isVisible: true
  };
  submitting = false;

  constructor(private supervisorService: SupervisorService) {}

  ngOnInit(): void {
    this.loadSupervisors();
  }

  loadSupervisors(silent = false): void {
    if (!silent) this.loading = true;
    this.supervisorService.getAll().subscribe({
      next: (data) => {
        this.supervisors = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load supervisors';
        this.loading = false;
      }
    });
  }

  addSupervisor(): void {
    this.editingSupervisor = null;
    this.supervisorData = {
      name: '',
      nickname: '',
      imageUrl: '',
      rating: 5,
      isVisible: true
    };
    this.showForm = true;
  }

  editSupervisor(supervisor: Supervisor): void {
    this.editingSupervisor = supervisor;
    this.supervisorData = {
      name: supervisor.name,
      nickname: supervisor.nickname,
      imageUrl: supervisor.imageUrl,
      rating: supervisor.rating,
      isVisible: supervisor.isVisible
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingSupervisor = null;
  }

  saveSupervisor(): void {
    if (!this.supervisorData.name.trim()) return;
    this.submitting = true;
    
    const request = this.editingSupervisor 
      ? this.supervisorService.update(this.editingSupervisor.id, this.supervisorData)
      : this.supervisorService.create(this.supervisorData);

    request.subscribe({
      next: () => {
        this.supervisorService.clearCache();
        this.loadSupervisors(true);
        this.cancelForm();
        this.submitting = false;
      },
      error: (err) => {
        alert('Failed to save supervisor');
        this.submitting = false;
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
