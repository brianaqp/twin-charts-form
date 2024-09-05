import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-upcoming',
    standalone: true,
    imports: [PositionTableComponent],
    template: `
    <div class="container">
        <div>
            <i class="bi bi-question-circle"></i>
            <span class="text-body-secondary">&nbsp;Datos desde hoy hasta 6 meses.</span>
        </div>
        <h1>Próximos por arrivar</h1>
        <app-position-table [data]="data"></app-position-table>
    </div>`
})
export class UpcomingComponent implements OnInit {
    data: any = [];

    private readonly apiSvc = inject(ApiService);

    ngOnInit(): void {
        // Pull data
        this.apiSvc.getDataByUpcoming().subscribe(res => {
            this.data = res.data.result;
        });
    }
}
