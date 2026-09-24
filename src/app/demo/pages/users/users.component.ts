import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UserManagementService, ManagedUser } from 'src/app/theme/shared/service/user-management.service';
import { AuthService } from 'src/app/theme/shared/service/auth.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: ManagedUser[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  // Create User Modal State
  showCreateModal = false;
  createData = {
    email: '',
    userName: '',
    password: '',
    role: 'CustomerSupport'
  };
  createLoading = false;

  // Edit User Modal State
  showEditModal = false;
  editingUser: ManagedUser | null = null;
  editData = {
    email: '',
    userName: '',
    role: 'CustomerSupport'
  };
  editLoading = false;

  // Change Password Modal State
  showPasswordModal = false;
  passwordUser: ManagedUser | null = null;
  newPassword = '';
  confirmPassword = '';
  passwordLoading = false;

  constructor(
    private userService: UserManagementService,
    public authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(silent = false): void {
    if (!silent) this.loading = true;
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error = 'فشل في تحميل قائمة المستخدمين';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): ManagedUser[] {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        (u.userName ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.role ?? '').toLowerCase().includes(term)
    );
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'badge bg-danger-subtle text-danger border border-danger';
      case 'Marketer':
        return 'badge bg-info-subtle text-info border border-info';
      case 'CustomerSupport':
      case 'Customer':
        return 'badge bg-success-subtle text-success border border-success';
      default:
        return 'badge bg-secondary-subtle text-secondary border';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'Admin':
        return 'مدير النظام (Admin)';
      case 'Marketer':
        return 'مسؤول تسويق (Marketer)';
      case 'CustomerSupport':
      case 'Customer':
        return 'خدمة العملاء (Support)';
      default:
        return role;
    }
  }

  isCurrentLoggedInUser(user: ManagedUser): boolean {
    const current = this.authService.currentUserValue;
    if (!current) return false;
    return current.email === user.email || current.userName === user.userName;
  }

  // --- Create User Flow ---
  openCreateModal(): void {
    this.createData = {
      email: '',
      userName: '',
      password: '',
      role: 'CustomerSupport'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    if (!this.createData.email || !this.createData.password) {
      this.toastService.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (this.createData.password.length < 6) {
      this.toastService.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    this.createLoading = true;
    this.userService
      .create({
        email: this.createData.email.trim(),
        userName: this.createData.userName.trim() || undefined,
        password: this.createData.password,
        role: this.createData.role
      })
      .subscribe({
        next: () => {
          this.createLoading = false;
          this.closeCreateModal();
          this.toastService.success('تم إنشاء المستخدم بنجاح');
          this.loadUsers(true);
        },
        error: (err) => {
          this.createLoading = false;
          const msg = err.error?.message || 'فشل في إنشاء المستخدم';
          this.toastService.error(msg);
        }
      });
  }

  // --- Edit User Flow ---
  openEditModal(user: ManagedUser): void {
    this.editingUser = user;
    this.editData = {
      email: user.email,
      userName: user.userName,
      role: user.role
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }

  submitEdit(): void {
    if (!this.editingUser) return;

    this.editLoading = true;
    this.userService
      .update(this.editingUser.id, {
        email: this.editData.email.trim(),
        userName: this.editData.userName.trim(),
        role: this.editData.role
      })
      .subscribe({
        next: () => {
          this.editLoading = false;
          this.closeEditModal();
          this.toastService.success('تم تحديث بيانات المستخدم بنجاح');
          this.loadUsers(true);
        },
        error: (err) => {
          this.editLoading = false;
          const msg = err.error?.message || 'فشل في تحديث بيانات المستخدم';
          this.toastService.error(msg);
        }
      });
  }

  // --- Change Password Flow ---
  openPasswordModal(user: ManagedUser): void {
    this.passwordUser = user;
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordUser = null;
    this.newPassword = '';
    this.confirmPassword = '';
  }

  submitChangePassword(): void {
    if (!this.passwordUser) return;

    if (!this.newPassword || this.newPassword.length < 6) {
      this.toastService.error('كلمة المرور يجب أن لا تقل عن 6 خانات');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    this.passwordLoading = true;
    this.userService.changePassword(this.passwordUser.id, this.newPassword).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.closePasswordModal();
        this.toastService.success(`تم تغيير كلمة المرور للمستخدم ${this.passwordUser?.userName || this.passwordUser?.email} بنجاح`);
      },
      error: (err) => {
        this.passwordLoading = false;
        const msg = err.error?.message || 'فشل في تغيير كلمة المرور';
        this.toastService.error(msg);
      }
    });
  }

  // --- Delete User Flow ---
  deleteUser(user: ManagedUser): void {
    if (this.isCurrentLoggedInUser(user)) {
      this.toastService.error('لا يمكنك حذف حساب المدير الخاص بك أثناء تسجيل الدخول!');
      return;
    }

    if (confirm(`هل أنت متأكد من رغبتك في حذف المستخدم "${user.userName || user.email}" نهائياً؟`)) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
          this.toastService.success('تم حذف المستخدم بنجاح');
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = err.error?.message || 'فشل في حذف المستخدم';
          this.toastService.error(msg);
        }
      });
    }
  }
}
