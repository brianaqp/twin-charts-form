import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-nav',
    standalone: true,
    imports: [RouterLink, NgbCollapseModule],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss',
})
export class NavComponent {
    isMenuCollapsed = true;

    toggleMenu() {
        this.isMenuCollapsed = !this.isMenuCollapsed;
    }
}
