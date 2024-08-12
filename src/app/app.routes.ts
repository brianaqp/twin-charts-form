import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { Token } from '@angular/compiler';
import { UsersComponent } from './components/users/users.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ConfigurationComponent } from './components/charts-config/configuration.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'users', component: UsersComponent },
    { path: 'add-user', component: AddUserComponent },
    { path: 'configuration', component: ConfigurationComponent },
    { path: '**', redirectTo: '' },
];
