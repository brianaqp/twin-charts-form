import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';

@Component({
    selector: 'app-weekly',
    standalone: true,
    imports: [PositionTableComponent],
    template: `
    <div class="container">
        <div>
            <i class="bi bi-question-circle"></i>
            <span class="text-body-secondary">&nbsp;Datos desde hoy hasta 10 dias.</span>
        </div>
        <h1>Semanal</h1>
        <app-position-table [data]="data"></app-position-table>
    </div>
    `
})
export class WeeklyComponent implements OnInit {
    // Services
    private readonly apiSvc = inject(ApiService);

    // Variables
    data: any[] = [];

    ngOnInit(): void {
        // Pull weekly data
        this.apiSvc.getDataByWeek().subscribe(res => {
            if (res.data.result) {
                this.data = res.data.result;
            }
        });
    }
}
