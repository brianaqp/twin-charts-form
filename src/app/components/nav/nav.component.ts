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

    toggleDarkMode() {
        // Edit html data-theme attribute
        const html = document.querySelector('html');
        if (!html) {
            return;
        }

        if (html.getAttribute('data-bs-theme') === 'dark') {
            html.setAttribute('data-bs-theme', 'light');
        } else {
            html.setAttribute('data-bs-theme', 'dark');
        }
    }
}
