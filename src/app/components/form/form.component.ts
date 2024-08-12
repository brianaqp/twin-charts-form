import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Observable, Subscription } from 'rxjs';
import { CustomDate, Statistics, StatisticsForm } from '../../interfaces/model';
import {
    NgbDateAdapter,
    NgbDateParserFormatter,
    NgbDatepickerModule,
    NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CustomDateAdapter, CustomDateParserFormatter } from './datepicker-services/custom.service';
import { CommunicationService } from '../../services/communication.service';
import { StringObjectId } from '../../interfaces/apiResponse';
import { InputWithDropdownComponent } from './components/input-with-dropdown.component';
import { OperationResultEvent } from '../../interfaces/alert';

/**
 * Clase que contiene metodos staticos que funcionan como validaciones personalizadas
 */
class CustomValidators {
    /**
     * Metodo que verifica si es un numero valido.
     * Aplica directamente al parametro 'tonnage'.
     */
    static isNumber(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (isNaN(value)) {
            return { isNotANumber: true };
        } else {
            return null;
        }
    }

    /**
     * Metodo que verifica si la fecha es valida.
     * Aplica para el parametro 'eta'
     */
    static isAValidDate(control: AbstractControl): ValidationErrors | null {
        const rawDate: string | CustomDate = control.value;

        if (typeof rawDate == 'string') {
            return { isNotAValidType: true };
        }

        const { year, month, day } = rawDate;
        const date = new Date(year, month - 1, day);
        // If is not a valid date, return error
        if (isNaN(date.getTime()) || date.toString() == 'Invalid Date') {
            return { isNotADate: true };
        }
        // If the year is less than 2010, return error
        if (date.getFullYear() < 2010) {
            return { isNotValidYear: true };
        }
        return null;
    }
}

/**
 * Tipo de dato que estructura un evento del formulario.
 * @param _id - The id of the document to delete
 * @param year - The year of the document in format 'YYYY'
 */
export type FormEvent<T> = { data: T; year: string };

@Component({
    selector: 'app-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgxMaskDirective,
        ReactiveFormsModule,
        NgbDatepickerModule,
        NgbDropdownModule,
        InputWithDropdownComponent,
    ],
    providers: [
        provideNgxMask(),
        // Parser y Adapder de la fecha para que maneje una estructura de fecha de tipo 'CustomDate'
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
        { provide: NgbDateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss',
})
export class FormComponent implements OnInit, OnDestroy {
    // --- Services
    private fb = inject(NonNullableFormBuilder);
    private communicationSvc = inject(CommunicationService);
    // Subscription to the communication service
    private subscriptions!: Subscription[];

    // --- Control Variables
    formSubmitted = false;
    isInEditMode = false;

    // --- Temp Edit Variables
    storedId: string | null = null;
    storedYear: string | null = null;

    // --- Form
    form = this.fb.group({
        vesselName: ['', [Validators.required]],
        eta: this.fb.control<CustomDate>({ day: 0, month: 0, year: 2024 }, [
            CustomValidators.isAValidDate,
        ]),
        tonnage: this.fb.control<string | number>(0, [CustomValidators.isNumber]),
        cargo: ['', [Validators.required]],
        importer: ['', [Validators.required]],
        trader: ['', [Validators.required]],
        loadingPort: ['', [Validators.required]],
        country: ['', [Validators.required]],
        dischargingPort: ['', [Validators.required]],
    });
    // Constans
    readonly availablePorts = [
        'ALTAMIRA',
        'CHIAPAS',
        'COATZACOALCOS',
        'GUAYMAS',
        'MANZANILLO',
        'PROGRESO',
        'TAMPICO',
        'TOPOLOBAMPO',
        'TUXPAN',
        'VERACRUZ',
        'ALTAMIRA',
        'CHIAPAS',
        'LAZARO CARDENAS',
        'TBC',
    ];

    // Form Events (outputs)
    insertEvent = output<FormEvent<Statistics>>();
    deleteEvent = output<FormEvent<StringObjectId>>();
    updateEvent = output<FormEvent<Statistics>>();
    errorEvent = output<string>();
    // Inputs | Observable that trigger cleanForm()
    @Input('operationResultObserver') operationObserver!: Observable<OperationResultEvent>;

    // --- AutoData
    autoData = input<{
        vesselsName: string[];
        cargo: string[];
        trader: string[];
        importer: string[];
        loadingPort: string[];
        dischargingPort: string[];
        country: string[];
    }>({
        vesselsName: [],
        cargo: [],
        trader: [],
        importer: [],
        loadingPort: [],
        dischargingPort: [],
        country: [],
    });

    ngOnInit() {
        // Subscribe to the communication service
        const commSubscription = this.communicationSvc
            .getObserver()
            .subscribe((data: Statistics) => {
                this.initEditMode(data);
            });

        // Subscribe to the clean observer
        const operationSubscription = this.operationObserver.subscribe(event => {
            if (event.type == 'inserted' || event.type == 'deleted') {
                this.clearForm();
            } else if (event.type == 'updated' && event.status) {
                if (event.properties) {
                    this.setStoredData(event.properties.objectId, event.properties.year);
                }
            }
        });

        this.subscriptions = [commSubscription, operationSubscription];
    }

    // --- EDIT MODE METHODS
    /**
     * Metodo que inicializa el proceso de edicion.
     * @param data
     */
    initEditMode(data: Statistics) {
        // Init edit mode
        this.isInEditMode = true;
        this.formSubmitted = false;

        // Generate a statistics form object,
        // store important data and set the form
        const rawObj = Object.assign({}, data);

        let storedYear = rawObj.eta.year.toString();
        let storedId = rawObj._id!;
        this.setStoredData(storedId, storedYear);

        delete rawObj._id;
        this.setForm(rawObj);
    }

    stopEditMode() {
        this.clearForm();
        // Stop edit mode and reset stored data
        this.isInEditMode = false;
        this.storedId = null;
        this.storedYear = null;
    }

    // --- FORM METHODS
    clearForm() {
        this.form.reset();
        // Shown no elements
        this.formSubmitted = false;
    }

    setForm(data: Statistics) {
        this.form.setValue(data);
    }

    // --- SETTERS
    setStoredData(id: string, year: string) {
        this.storedId = id;
        this.storedYear = year;
    }

    // --- FORM SUBMISSION METHODS
    onSubmit(type: 'insert' | 'update' | 'delete') {
        // Check if is delete
        if (type === 'delete') {
            this.onDelete();
            return;
        }

        console.log(this.form.value.vesselName)
        console.log('Form submitted', this.form.controls.vesselName.valid);
        // Validation
        this.formSubmitted = true;
        if (this.form.invalid) return;

        // Form and type conversion
        const formValue: StatisticsForm = this.form.getRawValue();
        const tonn = Number(formValue.tonnage);
        const date = formValue.eta as CustomDate;

        const item: Statistics = {
            ...formValue,
            eta: date,
            tonnage: tonn,
        };

        const body = {
            data: item,
            year: item.eta.year.toString(),
        };

        if (type === 'insert') {
            this.onInsert(body);
        } else if (type === 'update') {
            // Si hay un cambio en el año, se actualiza el año en body del evento
            if (this.storedYear !== body.data.eta.year.toString()) {
                body.year = this.storedYear!;
                // Caso que no, se actualiza el año en el body del evento
            }
            this.onUpdate(body);
        }
    }

    onInsert(body: FormEvent<Statistics>) {
        this.insertEvent.emit(body);
    }

    onUpdate(body: FormEvent<Statistics>) {
        body.data._id = this.storedId ? this.storedId : '';
        this.updateEvent.emit(body);
    }

    onDelete() {
        if (this.storedId && this.storedYear) {
            this.deleteEvent.emit({ data: this.storedId, year: this.storedYear });
        } else {
            this.errorEvent.emit(
                'Hubo un error en el formulario. Favor de dar click en cancelar y volver a intentarlo.',
            );
        }
    }
    // ---

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
