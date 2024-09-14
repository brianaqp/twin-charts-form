import { Component, inject, OnInit, ɵgetEnsureDirtyViewsAreAlwaysReachable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';
import { ChartsComponent } from '../charts/charts.component';

@Component({
    selector: 'app-upcoming',
    standalone: true,
    imports: [PositionTableComponent, NgbDropdownModule, AlertComponent, ChartsComponent],
    templateUrl: './upcoming.component.html',
    styles: `
    // Quita el simbolo de los dropdowns
    .custom-dropdown-toggle::after {
        display: none !important;
    }
    
    .icon-botton {
        font-size: 10px;
        margin-top: 19px !important;
    }`
})

export class UpcomingComponent implements OnInit {
    data: any[] = [];
    alert$ = new Subject<AlertEvent>();

    private readonly apiSvc = inject(ApiService);

    ngOnInit(): void {
        // Pull data
        this.apiSvc.getDataByUpcoming().subscribe({
            next: res => {
                if (res.data) {
                    this.data = res.data;
                }
            },
            error: e => {
                this.alert$.next({ message: 'Hubo un error en el servidor. No se pudo traer la informacion.', type: 'danger'})
            }
        });
    }

    downloadExcel() {
        this.apiSvc.getExcelByPeriod('upcoming').subscribe({
            next: (res: Blob) => {
                const blob = res;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `upcoming.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: e => {
                console.log(e)
            }
        })
    }
}
