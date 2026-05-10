import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { InvitationCardService } from 'src/app/theme/shared/service/invitation-card.service';
import { CountryService } from 'src/app/theme/shared/service/country.service';
import { SupervisorService } from 'src/app/theme/shared/service/supervisor.service';
import { EventTypeService } from 'src/app/theme/shared/service/event-type.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  stats = {
    cards: 0,
    countries: 0,
    supervisors: 0,
    eventTypes: 0
  };
  loading = true;

  private cardService = inject(InvitationCardService);
  private countryService = inject(CountryService);
  private supervisorService = inject(SupervisorService);
  private eventTypeService = inject(EventTypeService);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      cards: this.cardService.getAll(),
      countries: this.countryService.getAll(),
      supervisors: this.supervisorService.getAll(),
      eventTypes: this.eventTypeService.getAll()
    }).subscribe({
      next: (res) => {
        this.stats.cards = res.cards.length;
        this.stats.countries = res.countries.length;
        this.stats.supervisors = res.supervisors.length;
        this.stats.eventTypes = res.eventTypes.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
