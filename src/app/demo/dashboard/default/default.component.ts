import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { CardComponent } from '../../../theme/shared/components/card/card.component';
import { InvitationCardService } from '../../../theme/shared/service/invitation-card.service';
import { CountryService } from '../../../theme/shared/service/country.service';
import { SupervisorService } from '../../../theme/shared/service/supervisor.service';
import { EventTypeService } from '../../../theme/shared/service/event-type.service';
import { OrderService, Order, OrderStatus } from '../../../theme/shared/service/order.service';
import { ContactService, ContactMessage } from '../../../theme/shared/service/contact.service';
import { PackageService } from '../../../theme/shared/service/package.service';
import { BlogService } from '../../../theme/shared/service/blog.service';
import { forkJoin } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  stats = {
    cards: 0,
    countries: 0,
    supervisors: 0,
    eventTypes: 0,
    orders: 0,
    pendingOrders: 0,
    messages: 0,
    packages: 0,
    totalRevenue: 0
  };
  recentOrders: Order[] = [];
  latestMessages: ContactMessage[] = [];
  loading = true;

  chartOptions: any = {
    series: [
      {
        name: 'Sales',
        data: [31, 40, 28, 51, 42, 109, 100]
      }
    ],
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      categories: [
        '2026-05-05T00:00:00.000Z',
        '2026-05-06T00:00:00.000Z',
        '2026-05-07T00:00:00.000Z',
        '2026-05-08T00:00:00.000Z',
        '2026-05-09T00:00:00.000Z',
        '2026-05-10T00:00:00.000Z',
        '2026-05-11T00:00:00.000Z'
      ]
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      }
    },
    colors: ['#1890ff']
  };

  pieChartOptions: any = {
    series: [44, 55, 13, 43],
    chart: {
      type: 'donut',
      height: 350
    },
    labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ],
    colors: ['#faad14', '#1890ff', '#52c41a', '#f5222d']
  };

  private cardService = inject(InvitationCardService);
  private countryService = inject(CountryService);
  private supervisorService = inject(SupervisorService);
  private eventTypeService = inject(EventTypeService);
  private orderService = inject(OrderService);
  private contactService = inject(ContactService);
  private packageService = inject(PackageService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      cards: this.cardService.getAll(),
      countries: this.countryService.getAll(),
      supervisors: this.supervisorService.getAll(),
      eventTypes: this.eventTypeService.getAll(),
      orders: this.orderService.getAll(),
      messages: this.contactService.getAll(),
      packages: this.packageService.getAll()
    }).subscribe({
      next: (res) => {
        this.stats.cards = res.cards.length;
        this.stats.countries = res.countries.length;
        this.stats.supervisors = res.supervisors.length;
        this.stats.eventTypes = res.eventTypes.length;
        this.stats.orders = res.orders.length;
        this.stats.pendingOrders = res.orders.filter(o => o.status === OrderStatus.Pending).length;
        this.stats.messages = res.messages.filter(m => !m.isRead).length;
        this.stats.packages = res.packages.length;
        
        // Mock revenue calculation
        this.stats.totalRevenue = res.orders
          .filter(o => o.status === OrderStatus.Completed)
          .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        this.recentOrders = res.orders.slice(0, 5);
        this.latestMessages = res.messages.slice(0, 5);
        
        // Update pie chart
        const pending = res.orders.filter(o => o.status === OrderStatus.Pending).length;
        const processing = res.orders.filter(o => o.status === OrderStatus.Processing).length;
        const completed = res.orders.filter(o => o.status === OrderStatus.Completed).length;
        const cancelled = res.orders.filter(o => o.status === OrderStatus.Cancelled).length;
        this.pieChartOptions.series = [pending, processing, completed, cancelled];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'Pending';
      case OrderStatus.Processing: return 'Processing';
      case OrderStatus.Completed: return 'Completed';
      case OrderStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'bg-warning';
      case OrderStatus.Processing: return 'bg-primary';
      case OrderStatus.Completed: return 'bg-success';
      case OrderStatus.Cancelled: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
