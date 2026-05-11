import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OrderService, Order, OrderStatus } from 'src/app/theme/shared/service/order.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { InvitationCardService, InvitationCard } from 'src/app/theme/shared/service/invitation-card.service';
import { PackageService, Package } from 'src/app/theme/shared/service/package.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  cards: InvitationCard[] = [];
  packages: Package[] = [];
  loading = true;
  error = '';
  selectedOrder: Order | null = null;
  OrderStatus = OrderStatus;

  constructor(
    private orderService: OrderService,
    private cardService: InvitationCardService,
    private packageService: PackageService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  getPendingOrdersCount(): number {
    return this.orders.filter(o => o.status === OrderStatus.Pending).length;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    forkJoin({
      orders: this.orderService.getAll(),
      cards: this.cardService.getAll(),
      packages: this.packageService.getAll()
    }).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.cards = res.cards;
        this.packages = res.packages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders data:', err);
        this.error = 'Failed to load orders';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'بانتظار المراجعة';
      case OrderStatus.Processing: return 'قيد التنفيذ';
      case OrderStatus.Completed: return 'مكتمل';
      case OrderStatus.Cancelled: return 'ملغي';
      default: return 'غير معروف';
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'bg-light-warning text-warning';
      case OrderStatus.Processing: return 'bg-light-primary text-primary';
      case OrderStatus.Completed: return 'bg-light-success text-success';
      case OrderStatus.Cancelled: return 'bg-light-danger text-danger';
      default: return 'bg-light-secondary text-secondary';
    }
  }

  getCardTitle(id?: number): string {
    if (!id) return 'N/A';
    return this.cards.find(c => c.id === id)?.title || 'Unknown Card';
  }

  getPackageTitle(id?: number): string {
    if (!id) return 'N/A';
    return this.packages.find(p => p.id === id)?.name || 'Unknown Package';
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrder(): void {
    this.selectedOrder = null;
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        order.status = status;
        this.orderService.clearCache();
        this.toastService.success(`Order status updated to ${this.getStatusLabel(status)}`);
      },
      error: () => this.toastService.error('Failed to update order status')
    });
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.delete(id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== id);
          if (this.selectedOrder?.id === id) this.selectedOrder = null;
          this.toastService.success('Order deleted');
          this.orderService.clearCache();
        },
        error: () => this.toastService.error('Failed to delete order')
      });
    }
  }
}
