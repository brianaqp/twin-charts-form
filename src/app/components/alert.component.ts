import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { AlertEvent } from '../interfaces/alert';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-alert',
    imports: [NgbAlert, CommonModule],
    template: `@if (message) {
        <ngb-alert [type]="type" [dismissible]="true" (closed)="onClosedEvent()">{{
            message
        }}</ngb-alert>
    }`,
})
export class AlertComponent implements OnInit, OnDestroy {
    // Configuration
    readonly TIME = 5000;
    // Variables
    message: string = '';
    type: string = '';
    // Current Timer ID
    timerId!: any;
    // Observable
    @Input('alertObservable') alert$!: Observable<AlertEvent>;
    alertSubscription!: Subscription;

    ngOnInit() {
        this.alertSubscription = this.alert$.subscribe((alert: AlertEvent) => {
            this.message = alert.message;
            this.type = alert.type;
            this.reset();
        });
    }

    reset() {
        // If exists, clear the timer
        if (this.timerId) {
            clearTimeout(this.timerId);
        }

        // Set new timer
        this.timerId = setTimeout(() => {
            this.message = '';
            this.type = '';
        }, this.TIME);
    }

    onClosedEvent() {
        this.message = '';
        this.type = '';

        // if timer exists, clear it
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    ngOnDestroy() {
        this.alertSubscription.unsubscribe();
    }
}
