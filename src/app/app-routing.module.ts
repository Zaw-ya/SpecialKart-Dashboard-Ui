// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminLayout } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';

import { AuthGuard } from './theme/shared/service/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard/default',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'invitation-cards',
        loadComponent: () => import('./demo/pages/invitation-cards/invitation-cards.component').then((c) => c.InvitationCardsComponent)
      },
      {
        path: 'countries',
        loadComponent: () => import('./demo/pages/locations/countries/countries.component').then((c) => c.CountriesComponent)
      },
      {
        path: 'cities',
        loadComponent: () => import('./demo/pages/locations/cities/cities.component').then((c) => c.CitiesComponent)
      },
      {
        path: 'event-types',
        loadComponent: () => import('./demo/pages/locations/event-types/event-types.component').then((c) => c.EventTypesComponent)
      },
      {
        path: 'features',
        loadComponent: () => import('./demo/pages/features/features.component').then((c) => c.FeaturesComponent)
      },
      {
        path: 'supervisors',
        loadComponent: () => import('./demo/pages/supervisors/supervisors.component').then((c) => c.SupervisorsComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
