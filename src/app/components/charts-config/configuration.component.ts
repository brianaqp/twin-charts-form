import { Component, inject, OnInit } from '@angular/core';
import { ConfigurationService } from '../../services/configuration.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HoverClassDirective } from '../../directives/hover-class.directive';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-charts-config',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, HoverClassDirective, AlertComponent, NgbTooltipModule],
    providers: [ConfigurationService],
    templateUrl: './configuration.component.html',
    styleUrl: './configuration.component.scss',
})
export class ConfigurationComponent implements OnInit {
    private chartsSvc = inject(ConfigurationService);
    private fb = inject(FormBuilder);

    // --- Readonly properties ---
    readonly minYear = 2010;

    // Alert
    alert$ = new Subject<AlertEvent>();

    // Variables
    yearList: string[] = [];
    showHelpWindow = false;

    // --- Lifecycle methods ---
    ngOnInit() {
        // Pull available years
        this.chartsSvc.getAvailableYears().subscribe({
            next: res => {
                if (res.data && res.data.availableYears.length > 0) {
                    this.setYearList(res.data.availableYears);
                }
            },
            error: err => {
                this.alert$.next({
                    type: 'error',
                    message: 'Error. No se pudieron cargar los años disponibles. 01',
                });
            },
        });
    }

    // SETTERS OF YEARLIST
    setYearList(yearList: string[]) {
        this.yearList = yearList;
        this.sortYearList();
    }

    addYear(year: string) {
        this.yearList.push(year);
        this.sortYearList();
    }

    removeYear(index: number) {
        this.yearList.splice(index, 1);
        this.sortYearList();
    }

    sortYearList() {
        this.yearList.sort((a, b) => parseInt(a) - parseInt(b));
    }

    // --- Validation methods ---
    isValidYear(year: string): boolean {
        const yearInNumber = parseInt(year);
        // If not a number, return false
        if (isNaN(yearInNumber)) {
            return false;
        } else if (yearInNumber < 2010) {
            return false;
        } else {
            return true;
        }
    }

    onAddYear(year: string) {
        // 1. Check validity
        if (this.isValidYear(year)) {
            // 2. Add to server
            const body = { year };
            this.chartsSvc.insertYear(body).subscribe({
                next: res => {
                    if (res.log.modifiedCount == 1) {
                        this.addYear(year);
                        this.alert$.next({ type: 'success', message: 'Año agregado con éxito.' });
                    }

                    if (res.log.modifiedCount == 0) {
                        this.alert$.next({
                            type: 'secondary',
                            message:
                                'El documento no se modifico. Compruebe si el año ingresado ya existe.',
                        });
                    }
                },
                error: err => {
                    this.alert$.next({
                        type: 'error',
                        message: 'Error. No se pudo agregar el año al documento. 02',
                    });
                },
            });
        } else {
            this.alert$.next({
                type: 'warning',
                message:
                    'El año ingresado no es válido. Tiene que ser mayor al 2010 e incluir solo numeros.',
            });
        }
    }

    onRemoveYear(index: number, item: string) {
        // Solo se puede eliminar si hay mas de un año
        if (this.yearList.length <= 1) {
            this.alert$.next({
                type: 'warning',
                message: 'No se puede eliminar el único año disponible.',
            });
            return;
        };
        this.chartsSvc.deleteYear(item).subscribe({
            next: res => {
                if (res.log.modifiedCount >= 1) {
                    this.removeYear(index);
                }
                if (res.log.modifiedCount == 0) {
                    // [ ] show message
                    this.alert$.next({
                        type: 'secondary',
                        message: 'El documento no se modifico.',
                    });
                }
            },
            error: err => {
                this.alert$.next({
                    type: 'error',
                    message: 'Error. No se pudo eliminar el año. 03',
                });
            },
        });
    }
}
