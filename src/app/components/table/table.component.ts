import { Component, inject, input, effect, OnInit, output } from '@angular/core';
import {
    Statistics,
    StatisticsFilterForm,
    StatisticsForm,
    StatisticsKeys,
} from '../../interfaces/model';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CustomDatePipe } from '../../../pipes/custom-date.pipe';

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [CommonModule, CustomDatePipe, FormsModule, ReactiveFormsModule],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
    // --- Services
    private fb = inject(NonNullableFormBuilder);
    // Variables
    readonly sourceData = input<Statistics[]>([]); // Fuente sin modificar
    displayedData: Statistics[] = []; // Fuente modificable
    // --- Events
    editEvent = output<Statistics>();
    // Table variables
    lastColumnSorted!: StatisticsKeys;

    // Effects listen parent data changes and assing it to displayed values
    constructor() {
        effect(() => {
            if (this.sourceData().length > 0) {
                this.displayedData = this.sourceData();
            }
        });
    }

    // --- Form who will work as a filter option to the table without tonnage
    filterForm = this.fb.group<StatisticsFilterForm>({
        vesselName: '',
        cargo: '',
        importer: '',
        trader: '',
        loadingPort: '',
        country: '',
        dischargingPort: '',
        eta: '',
    });

    ngOnInit(): void {
        // -- Filter form subscription
        this.filterForm.valueChanges.subscribe(value => {
            this.filterData(value);
        });
    }

    // --- Form methods
    resetFilterForm() {
        // Reset form and sorting
        this.filterForm.reset();
        this.sort('eta', true);
    }

    /**
     * Metodo que partiendo de un objeto de tipo StatisticsFilterForm, filtra dependiendo
     * de cada una de los valores del formulario, generando una busqueda por propiedad
     * @param filteredItem
     */
    filterData(filteredItem: Partial<StatisticsFilterForm>) {
        const properties = Object.keys(filteredItem) as (keyof StatisticsFilterForm)[];

        // Filtering source data
        this.displayedData = this.sourceData().filter(sourceItem => {
            // For every item in the source data, check if it matches the filter
            return properties.every(property => {
                const sourceValue = sourceItem[property];
                const filterValue = filteredItem[property];

                // For every property, first check if the filter has not a value
                if (filterValue === undefined || filterValue === '') {
                    return true;
                }

                if (sourceValue) {
                    return this.compareValues(sourceValue, filterValue, property);
                }

                // If no source Value
                return false;
            });
        });
    }

    /**
     * Compare function for filtering including string, number and date
     * @param a Source value
     * @param b Filter value
     */
    compareValues(a: any, b: any, property: StatisticsKeys): boolean {
        // Parse
        if (property == 'eta') {
            a = `${a.day}/${a.month}/${a.year}`;
        }

        if (typeof a == 'string' && typeof b == 'string') {
            const regex = new RegExp(
                b
                    .split(' ')
                    .map((word: string) => word.trim())
                    .join('.*'),
                'i',
            );
            return regex.test(a);
        }

        return false;
    }

    // --- Table methods
    onItemClicked(item: Statistics) {
        console.log(item)
        this.editEvent.emit(item);
    }

    /**
     * Metodo que ordena la informacion mostrada dependiendo de
     * la columna recibida.
     * @param column String de tipo StatisticsKeys
     * @param formReseted Variable de control que indica un restablecimiento del formulario.
     */
    sort(column: StatisticsKeys, formReseted?: boolean) {
        const property = column;
        // Si la propiedad es igual, girala.
        if (this.lastColumnSorted == column) {
            // En caso de ser un reinicio del formulario, se aplica un retorno temprano.
            if (formReseted) {
                return;
            }
            this.displayedData.reverse();
            return;
        }

        this.displayedData.sort((a, b) => {
            // Si no existe ninguna propiedad, retorna 0
            if (!a[property] || !b[property]) {
                return 0;
            }
            // --- Manejo de propiedades
            // Date
            if (property == 'eta') {
                const dateA = new Date(a.eta.year, a.eta.month, a.eta.day);
                const dateB = new Date(b.eta.year, b.eta.month, b.eta.day);
                return dateA.getTime() - dateB.getTime();
            }

            // Number
            if (property == 'tonnage') {
                return a[property] - b[property];
            }

            // string
            if (typeof a[property] === 'string' && typeof b[property] === 'string') {
                return a[property].localeCompare(b[property], 'en');
            }

            return 0;
        });
        // Se almacena el valor de la ultima columna para generar un efecto de filtado descendente en una
        // segunda llamada.
        this.lastColumnSorted = column;
    }
}
