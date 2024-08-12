import { Component, OnDestroy, OnInit, Signal, effect, inject, signal } from '@angular/core';
import { Statistics, StatisticsKeys } from '../interfaces/model';
import { ApiResponse, StringObjectId } from '../interfaces/apiResponse';
import { AlertEvent, OperationResultEvent } from '../interfaces/alert';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormComponent, FormEvent } from '../components/form/form.component';
import { TableComponent } from '../components/table/table.component';
import { Subject, catchError, forkJoin, from, mergeMap, of, switchMap, toArray } from 'rxjs';
import { AlertComponent } from '../components/alert.component';
import { CommunicationService } from '../services/communication.service';
import { UsersService } from '../services/users.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

/** Component que representa la aplicación principal
 * @description Se encarga de manejar los eventos de los componentes hijos y de comunicarse con el servicio de la API.
 * Cuenta con dos componentes, uno es el formulario y el otro es la tabla.
 */

@Component({
    standalone: true,
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [
        FormsModule,
        CommonModule,
        FormComponent,
        TableComponent,
        AlertComponent,
        NgbDropdownModule,
    ],
    providers: [ApiService, CommunicationService, UsersService],
})
export class MainComponent implements OnInit, OnDestroy {
    private readonly apiSvc = inject(ApiService);
    private readonly commSvc = inject(CommunicationService); // Provide communication with the form component.
    private readonly authSvc = inject(UsersService);

    // --- PROPERTIES
    // Variable que almacena las estadisticas recibidas.
    dataset: Statistics[] = [];

    // Arreglo con los años disponibles y el año seleccionado
    yearsAvailable = signal<string[]>([]);
    yearSelected: string = '';

    // --- SUBJECTS
    operationResult$ = new Subject<OperationResultEvent>(); // Envia una señal que indica si la operacion fue exitosa o no.
    $alert = new Subject<AlertEvent>(); // Envia una señal para mostrar una alerta

    // Variables que almacenan el autocompletado.
    autoDataVessels!: string[];
    autoDataCargos!: string[];
    autoDataImporter!: string[];
    autoDataTrader!: string[];
    autoDataLoadingPort!: string[];
    autoDataDischPort!: string[];
    autoDataCountry!: string[];

    constructor() {
        // Se trae la informacion cada que el año cambia.
        effect(() => {
            if (this.yearsAvailable().length > 0) {
                this.pullAutoComplete();
            }
        });
    }

    ngOnInit() {
        this.start();
    }

    /**
     * Metodo que inicia la aplicación obteniendo los años disponibles y los datos del año seleccionado.
     */
    start() {
        this.apiSvc
            .getYears()
            .pipe(
                // Si no hay años disponibles, se continua con un arreglo vacio
                // Si hay años disponibles, se asignan variables y retorna una llamada a getDataByYear
                switchMap(res => {
                    if (res.data.length == 0) return of({ data: [] });

                    // If there are years available, select the first one
                    this.yearsAvailable.set(res.data);
                    this.yearSelected = this.yearsAvailable()[0];
                    return this.apiSvc.getDataByYear(this.yearSelected);
                }),
                catchError(error => {
                    console.log('Error getting years:', error.message);
                    this.$alert.next({
                        message: 'Hubo un error, favor de volver a intentarlo. 101',
                        type: 'danger',
                    });
                    return of({ data: [] }); // Continue with an empty array
                }),
            )
            .subscribe({
                // Si hay datos, se procesan; si no, no se hace nada
                next: res => {
                    this.processGetResponse(res);
                },
                error: error => {
                    // En caso de error, mostrar alerta
                    this.$alert.next({
                        message: 'Hubo un error, favor de volver a intentarlo. 101',
                        type: 'danger',
                    });
                },
            });
    }

    // Metodo que procesa la respuesta GET de la API al traer la informacion de un año
    processGetResponse(res: ApiResponse<Statistics[], null> | { data: never[] }) {
        if (res.data.length == 0) return;
        // Parse data and assign it to the dataset
        this.dataset = res.data;
    }

    // --- DOM EVENTS HANDLERS
    // Al cambiar de año, se obtienen los datos
    yearChangedHandler() {
        this.apiSvc.getDataByYear(this.yearSelected).subscribe({
            next: res => this.processGetResponse(res),
            error: error => {
                this.$alert.next({
                    message: 'Hubo un error, favor de volver a intentarlo. 103',
                    type: 'danger',
                });
            },
        });
    }

    // --- FORM EVENT HANDLERS
    // Metodos que se disparan el recibir los eventos correspondientes de mi formulario.
    onInsertItem(event: FormEvent<Statistics>) {
        this.apiSvc.insertOne(event.data, event.year).subscribe({
            next: res => {
                if (res.log.acknowledged) {
                    // Construct the object with the new id
                    const objWithId = { ...event.data, _id: res.data };
                    // Insert the new item into the dataset if the year is the same
                    if (this.yearSelected == event.year) this.dataset.push(objWithId);
                    // Clean form and show alert
                    this.operationResult$.next({ type: 'inserted', status: 1, properties: null });
                    this.$alert.next({
                        message: 'Documento guardado con exito!',
                        type: 'success',
                    });
                }
            },
            error: e => {
                this.operationResult$.next({ type: 'inserted', status: 0, properties: null });
                this.$alert.next({
                    message: 'Hubo un error. No se pudo crear el nuevo documento.',
                    type: 'danger',
                });
            },
        });
    }

    onDeleteItem(event: FormEvent<StringObjectId>) {
        this.apiSvc.deleteOne(event.data, event.year).subscribe({
            next: res => {
                if (res.log.deletedCount == 1) {
                    this.dataset = this.dataset.filter(item => item._id !== event.data);
                    // Clean form and show alert
                    this.operationResult$.next({ type: 'deleted', status: 1, properties: null });
                    this.$alert.next({
                        message: 'Elemento eliminado con exito',
                        type: 'success',
                    });
                }
                // Si no se elimino, se muestra un mensaje secundario
                if (res.log.deletedCount == 0) {
                    this.$alert.next({
                        message: 'El elemento no pudo eliminarse.',
                        type: 'secondary',
                    });
                }
            },
            error: () => {
                this.operationResult$.next({ type: 'deleted', status: 0, properties: null });
                this.$alert.next({
                    message:
                        'Hubo un problema interno del servidor. Por favor, vuelva a intentarlo. 103',
                    type: 'danger',
                });
            },
        });
    }

    onUpdateItem(event: FormEvent<Statistics>) {
        // BUG: Al actualizar el documento hay que verificar si hubo un cambio de coleccion.
        // El problema es el año que se envia, ya que esta mandando el ano actualizado, y no el anterior!
        this.apiSvc.updateOne(event.data, event.year).subscribe({
            next: res => {
                if (res.log.modified == 1) {
                    // Si se modifico correctamente, se obtiene la referencia del arreglo original,
                    // y se modifica con las propiedades editadas.
                    const item = this.dataset.find(item => item._id === event.data._id);
                    if (item) Object.assign(item, event.data);

                    // Se muestra una alerta de exito,
                    this.operationResult$.next({
                        type: 'updated',
                        status: 1,
                        properties: res.log.properties,
                    });

                    this.$alert.next({
                        message: 'El documento se modifico con exito.',
                        type: 'success',
                    });
                }

                if (res.log.modified == 0) {
                    this.$alert.next({
                        message: 'El documento no se modifico.',
                        type: 'secondary',
                    });
                }
            },
            error: () => {
                this.operationResult$.next({ type: 'updated', status: 0, properties: null });
                this.$alert.next({
                    message: 'Hubo un problema en el servidor. No pudo actualizarse el documento',
                    type: 'danger',
                });
            },
        });
    }

    onFormError(error: string) {
        this.$alert.next({
            message: error,
            type: 'danger',
        });
    }

    // Metodo que trae cada field de mi autocompletado
    pullAutoComplete() {
        const fields: StatisticsKeys[] = [
            'vesselName',
            'cargo', 
            'importer',
            'trader',
            'loadingPort',
            'dischargingPort',
            'country',
        ];

        from(fields)
            .pipe(
                mergeMap(field =>
                    this.apiSvc.getAutoCompleteData(field).pipe(
                        catchError(error => {
                            console.error(`Error retrieving autocomplete for ${field}:`, error);
                            return of({ message: '', data: {
                                data: [],
                                field: field,
                            }, log: null }); // Return an empty array for the failed request
                        }),
                    ),
                ),
                toArray(),
            )
            .subscribe(results => {
                results.forEach((result) => {
                    switch (result.data.field) {
                        case 'vesselName':
                            this.autoDataVessels = result.data.data;
                            break;
                        case 'cargo':
                            this.autoDataCargos = result.data.data;
                            break;
                        case 'importer':
                            this.autoDataImporter = result.data.data;
                            break;
                        case 'trader':
                            this.autoDataTrader = result.data.data;
                            break;
                        case 'loadingPort':
                            this.autoDataLoadingPort = result.data.data;
                            break;
                        case 'dischargingPort':
                            this.autoDataDischPort = result.data.data;
                            break;
                        case 'country':
                            this.autoDataCountry = result.data.data;
                            break;
                    }
                });
            });
    }

    // --- Table methods
    /**
     * Metodo que emite un evento al formulario para que inicie el modo edicion,
     * y mueve la vista del usuario al inicio del aplicativo.
     * @param item
     */
    editEventHandler(item: Statistics) {
        this.commSvc.emitData(item);

        const main_doc = document.getElementById('main');
        if (main_doc) {
            main_doc.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    ngOnDestroy() {
        this.operationResult$.complete();
        this.$alert.complete();
    }

    // --- Excel methods
    downloadExcel(): void {
        this.apiSvc.getDataInExcel(this.yearSelected).subscribe({
            next: (res: Blob) => {
                const blob = res;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `edited_vessel_data_${this.yearSelected}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: error => {
                this.$alert.next({
                    message: 'Hubo un error al descargar el archivo.',
                    type: 'danger',
                });
            },
        });
    }
}
