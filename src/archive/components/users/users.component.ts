import { Component, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/users';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { NgbModal, NgbToastModule, NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../components/alert.component';

@Component({
    selector: 'app-tokens',
    standalone: true,
    imports: [CommonModule, FilterPipe, NgbTooltipModule, AlertComponent, NgbToastModule],
    providers: [UsersService],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
    // Service
    private userSvc = inject(UsersService);
    private modalSvc = inject(NgbModal);
    // --- Variables
    users: User[] = [];
    searchInput = signal<string>('');
    // Temporal user to show in modal
    tempUser: User | null = null;
    // Tooltip options
    readonly time = 3000;

    isToastAlive = false;

    // Viewchied of the tooltips
    @ViewChild('t1') revalidateTooltip!: NgbTooltip;
    @ViewChild('t2') revokeTooltip!: NgbTooltip;

    // --- LIFECYCLE METHODS
    ngOnInit() {
        this.userSvc.get().subscribe({
            next: res => {
                if (res.data && res.data.length > 0) {
                    this.setUsers(res.data);
                }
            },
            error: err => {
                this.showToast();
            },
        });
    }

    // --- DOM METHODS
    onSearchInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.searchInput.set(target.value);
    }

    // --- TOOLTIP METHODS
    showTooltip(tooltipElement: NgbTooltip, message: string) {
        tooltipElement.ngbTooltip = message;
        if (!tooltipElement.isOpen()) {
            tooltipElement.open();
            setTimeout(() => {
                tooltipElement.close();
                tooltipElement.ngbTooltip = '';
            }, this.time);
        }
    }

    // --- TOAST METHODS
    showToast() {
        this.isToastAlive = true;
    }

    // --- MODAL METHODS
    openModal(content: TemplateRef<any>, user: User) {
        // Open modal
        this.tempUser = user;
        this.modalSvc.open(content, { ariaLabelledBy: 'modal-delete-user' }).result.then(
            result => {
                console.log(result);
                if (result === 'confirm') {
                    this.revokeUser(user);
                }
                this.tempUser = null;
            },
            reason => {
                console.log(reason);
                this.tempUser = null;
            },
        );
    }

    // --- User management methods
    setUsers(data: User[]) {
        // Set and sort by finishAt (iso date)
        this.users = data;
        this.users.sort((a, b) => {
            if (a.finishAt < b.finishAt) {
                return -1;
            }
            if (a.finishAt > b.finishAt) {
                return 1;
            }
            return 0;
        });
    }

    revalidateUser(user: User) {
        const _id = user._id as string;
        this.userSvc.revalidate(_id).subscribe({
            next: res => {
                this.showTooltip(this.revalidateTooltip, 'Token revalidated');
            },
            error: err => {
                this.showTooltip(this.revalidateTooltip, 'Error while revalidating token');
            },
        });
    }

    /**
     * Method to revoke the user credentials
     * @param token
     */
    revokeUser(user: User) {
        const _id = user._id as string;
        this.userSvc.revoke(_id).subscribe({
            next: res => {
                this.users = this.users.filter(t => t._id !== user._id);
            },
            error: err => {
                this.showTooltip(this.revokeTooltip, 'Error while revoking token');
            },
        });
    }

    // --- Date diff methdos
    /**
     * Method to check the status of the user credentials and return it as a string,
     * and show it as a badge with type in the UI
     * @param user
     * @returns 'valid' | 'invalid' | 'soon'
     */
    checkStatus(user: User): 'valid' | 'invalid' | 'soon' {
        const now = new Date();
        const expires = new Date(user.finishAt);
        let valid = now < expires;
        if (valid) {
            const dayDiff = this.checkDays(user);
            if (dayDiff < 4) {
                return 'soon';
            } else {
                return 'valid';
            }
        } else {
            return 'invalid';
        }
    }

    /**
     * Method to check the days left to expire the user credentials
     * @param user
     * @returns number
     * */
    checkDays(user: User): number {
        const expires = new Date(user.finishAt);
        const now = new Date();
        const timeDiff = expires.getTime() - now.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);
        return Math.ceil(dayDiff);
    }
}
