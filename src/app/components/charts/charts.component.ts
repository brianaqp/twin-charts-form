import { Component, effect, HostListener, input } from '@angular/core';
import * as echarts from 'echarts';
import chroma from 'chroma-js';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [],
  template: `<div id="chart" style="width: 100%; height: 400px"></div>`
})
export class ChartsComponent {
  chart !: echarts.ECharts;
  data = input<any[]>([]);

  // Chart configuration
  readonly maxItems = 15;
  readonly chartColorRanges = [
    '#2c3e50',
    '#8e44ad',
    '#2980b9',
    '#16a085',
    '#f39c12',
    '#d35400',
    '#c0392b',
  ];

  constructor() {
    effect(() => {
      if (this.data().length) {
        this.initChart();
      }
    })
  }

  // Resize event for windows!
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }

  initChart() {
    this.chart = echarts.init(document.getElementById('chart'));

    const vesselsMap = new Map<string, any>();
    const portsSet = new Set<string>();

    // Procesar los datos
    this.data().forEach(item => {
        const { vesselName, dischargingPort, tonnage } = item;

        // Agregar puerto al set de puertos
        portsSet.add(dischargingPort);

        // Actualizar el mapa de embarcaciones
        if (!vesselsMap.has(vesselName)) {
            vesselsMap.set(vesselName, {});
        }

        const vesselPorts = vesselsMap.get(vesselName);
        vesselPorts[dischargingPort] = (vesselPorts[dischargingPort] || 0) + tonnage;
    });

    // Crear etiquetas (nombres de embarcaciones)
    const vesselLabels = Array.from(vesselsMap.keys());

    // Crear series de datos
    const series: any[] = Array.from(portsSet).map(port => ({
        name: port,
        type: 'bar',
        data: vesselLabels.map(vessel => vesselsMap.get(vessel)[port] || 0),
        itemStyle: {}
    }));

    // Crear paleta de colores
    const colorPalette = chroma
        .scale(this.chartColorRanges)
        .mode('lch')
        .colors(series.length);

    // Asignar colores a las series
    series.forEach((serie, index) => {
        serie.itemStyle = { color: colorPalette[index] };
    });

    // Definir opciones de la gráfica
    const chartOptions: echarts.EChartsOption = {
        tooltip: { show: true },
        legend: { show: true },
        toolbox: {
            feature: {
                saveAsImage: { type: 'png' }
            }
        },
        xAxis: {
            data: vesselLabels,
            interval: 0,
        },
        yAxis: {},
        series: series
    };

    // Establecer opciones en la gráfica
    this.chart.setOption(chartOptions);
}

}
