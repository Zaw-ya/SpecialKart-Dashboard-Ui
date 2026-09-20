import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OrderService, Order, OrderStatus } from 'src/app/theme/shared/service/order.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';
import { InvitationCardService, InvitationCard } from 'src/app/theme/shared/service/invitation-card.service';
import { PackageService, Package } from 'src/app/theme/shared/service/package.service';
import { MetaLeadEventsService, MetaRecordStatus } from 'src/app/theme/shared/service/meta-lead-events.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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

  activeFilter: 'all' | 'design' | 'package' = 'all';

  highlightId: number | null = null;
  metaStatuses: Record<string, MetaRecordStatus> = {};

  constructor(
    private orderService: OrderService,
    private metaService: MetaLeadEventsService,
    private cardService: InvitationCardService,
    private packageService: PackageService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get filteredOrders(): Order[] {
    if (this.activeFilter === 'design') {
      return this.orders.filter(o => o.invitationCardId || !o.packageId);
    } else if (this.activeFilter === 'package') {
      return this.orders.filter(o => !!o.packageId);
    }
    return this.orders;
  }

  get designOrdersCount(): number {
    return this.orders.filter(o => o.invitationCardId || !o.packageId).length;
  }

  get packageOrdersCount(): number {
    return this.orders.filter(o => !!o.packageId).length;
  }

  getPendingOrdersCount(): number {
    return this.filteredOrders.filter(o => o.status === OrderStatus.Pending).length;
  }

  setFilter(filter: 'all' | 'design' | 'package'): void {
    this.activeFilter = filter;
    let url = '/orders';
    if (filter === 'design') url = '/orders/designs';
    else if (filter === 'package') url = '/orders/packages';
    this.router.navigateByUrl(url);
  }

  openWhatsApp(phone: string): void {
    const clean = phone.replace('+', '').replace(/\s+/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      if (data['filterType']) {
        this.activeFilter = data['filterType'];
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.activeFilter = params['type'];
      }
      this.highlightId = params['highlight'] ? Number(params['highlight']) : null;
    });

    this.loadData();
    this.loadMetaStatuses();
  }

  /** Delivery status of the Meta Lead event for each order (optional column). */
  loadMetaStatuses(): void {
    this.metaService.getStatusMap('OrderForm').subscribe({
      next: (map) => {
        this.metaStatuses = map;
        this.cdr.detectChanges();
      },
      error: () => (this.metaStatuses = {})
    });
  }

  metaStatus(id: number): MetaRecordStatus {
    return this.metaStatuses[String(id)] ?? 'none';
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

  getEntityLabel(entityType?: string): string {
    if (!entityType) return 'غير محدد';
    return entityType.toLowerCase() === 'company' || entityType === 'شركة' ? 'شركة' : 'فرد';
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
