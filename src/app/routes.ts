import { Routes } from '@angular/router';
import { PageOriginalComponent } from './original/page-original';

export const routes: Routes = [
  { path: '', component: PageOriginalComponent },
  { path: '**', redirectTo: '' },
];
