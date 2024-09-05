import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { WeeklyComponent } from './components/weekly/weekly.component';
import { UpcomingComponent } from './components/upcoming/upcoming.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'weekly', component: WeeklyComponent },
    { path: 'upcoming', component: UpcomingComponent },
    { path: '**', redirectTo: '' },
];
