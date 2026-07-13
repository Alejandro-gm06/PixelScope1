import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'channels',
        loadComponent: () => import('./pages/channels/channels.page').then(m => m.ChannelsPage),
      },
      {
        path: 'color-spaces',
        loadComponent: () => import('./pages/color-spaces/color-spaces.page').then(m => m.ColorSpacesPage),
      },
      {
        path: 'inspector',
        loadComponent: () => import('./pages/inspector/inspector.page').then(m => m.InspectorPage),
      },
      {
        path: 'histograms',
        loadComponent: () => import('./pages/histograms/histograms.page').then(m => m.HistogramsPage),
      },
      {
        path: 'comparator',
        loadComponent: () => import('./pages/comparator/comparator.page').then(m => m.ComparatorPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
