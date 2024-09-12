import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PositionTableComponent } from '../position-table/position-table.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';
import * as echarts from 'echarts';

@Component({
    selector: 'app-weekly',
    standalone: true,
    imports: [PositionTableComponent, NgbDropdownModule, AlertComponent],
    template: `
    <div class="container">
        <app-alert [alertObservable]="alert$.asObservable()"></app-alert>
        <div id="chart" style="width: 1200px; height: 200px"></div>
        <div>
            <i class="bi bi-question-circle"></i>
            <span class="text-body-secondary">&nbsp;Datos desde hoy hasta 10 dias.</span>
        </div>
        <div class="d-flex flex-row" >
            <h1>Semanal</h1>    
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
        <footer class="mt-2">&nbsp;</footer>
    </div>
    `,
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
export class WeeklyComponent implements OnInit, AfterViewInit {
    // Services
    private readonly apiSvc = inject(ApiService);
    // Variables
    data: any[] = [];   
    alert$ = new Subject<AlertEvent>()
    chart!: echarts.ECharts;

    ngOnInit(): void {
        // Pull weekly data
        this.apiSvc.getDataByWeek().subscribe({
            next: res => {
                if (res.data) {
                    this.data = res.data;
                    this.initChart();
                }},
            error: e => {
                this.alert$.next({ message: 'Hubo un error en el servidor. No se pudo traer la informacion.', type: 'danger'})
            }
        });
    }


    ngAfterViewInit() {
        this.initChart()
    }

    initChart() {
        this.chart = echarts.init(document.getElementById('chart'));

        // Create an object
        /** {
         * vesselName: string,
         * {
         * - Veracruz: 10,000
         * - Tampico: 2,500
         * 
         * }
         * } */ 
        

        const options: echarts.EChartsOption = {
            title: {
              text: 'Example'
            },
            tooltip: {},
            toolbox: {
                feature: {
                    saveAsImage: {
                        type: 'png',

                    }
                }
            },
            xAxis: {
              data: this.data.map(i => i.vesselName),
              interval: 0,
            },
            yAxis: {},
            series: [
              {
                name: 'sales',
                type: 'bar',
                data: this.data.map(i => i.tonnage)
              }
            ]
          };

        this.chart.setOption(options)
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
