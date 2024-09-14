import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';
import { ChartsComponent } from '../charts/charts.component';

@Component({
    selector: 'app-weekly',
    standalone: true,
    imports: [PositionTableComponent, NgbDropdownModule, AlertComponent, ChartsComponent],
    templateUrl: './weekly.component.html',
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
export class WeeklyComponent implements OnInit {
    // Services
    private readonly apiSvc = inject(ApiService);
    // Variables
    data: any[] = [];   
    alert$ = new Subject<AlertEvent>()

    ngOnInit(): void {
        // Pull weekly data
        this.apiSvc.getDataByWeek().subscribe({
            next: res => {
                if (res.data) {
                    this.data = res.data;
                }},
            error: e => {
                this.alert$.next({ message: 'Hubo un error en el servidor. No se pudo traer la informacion.', type: 'danger'})
            }
        });
    }

    downloadExcel() {
        this.apiSvc.getExcelByPeriod('weekly').subscribe({
            next: (res: Blob) => {
                const blob = res;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `weekly.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: e => {
                this.alert$.next({ message: 'Hubo un error en el servidor. No se pudo traer la informacion.', type: 'danger'})
            }
        })
    }
}
