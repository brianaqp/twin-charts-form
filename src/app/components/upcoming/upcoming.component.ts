import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';

@Component({
    selector: 'app-upcoming',
    standalone: true,
    imports: [PositionTableComponent, NgbDropdownModule, AlertComponent],
    template: `
    <div class="container">
        <app-alert [alertObservable]="alert$.asObservable()"></app-alert>
        <div>
            <i class="bi bi-question-circle"></i>
            <span class="text-body-secondary">&nbsp;Datos desde hoy hasta 6 meses.</span>
        </div>
        <div class="d-flex flex-row" >
            <h1>Próximos por arrival</h1>
            <div ngbDropdown>
                <button class="btn btn-sm custom-dropdown-toggle" type="button" ngbDropdownToggle>
                    <i class="bi bi-caret-down"></i>
                </button>
                <div ngbDropdownMenu>
                    <button type="button" ngbDropdownItem (click)="downloadExcel()">Download Excel</button>
                </div>
            </div>
        </div>
        <app-position-table [data]="data"></app-position-table>
    </div>`,
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
    data: any = [];
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
