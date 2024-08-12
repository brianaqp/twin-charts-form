import { Component, effect, forwardRef, input, OnInit, ViewChild } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
} from '@angular/forms';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-input-with-dropdown',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgbDropdownModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputWithDropdownComponent),
            multi: true,
        },
    ],
    template: ` <div ngbDropdown #drop="ngbDropdown">
        <label for="input">{{ title() }}</label>
        <input
            type="text"
            class="form-control form-control-sm"
            id="input"
            (input)="onInput($event)"
            [value]="value"
            class="form-control"
            ngbDropdownAnchor
        />
        <div ngbDropdownMenu>
            @for (i of filteredItems; track $index) {
                <button ngbDropdownItem (click)="clickOnItem(i)">
                    {{ i }}
                </button>
            }
        </div>
    </div>`,
})
export class InputWithDropdownComponent implements ControlValueAccessor {
    // Variables y métodos de ControlValueAccessor
    value: string = '';
    onChange: any = () => {};
    onTouched: any = () => {};

    // Escribe un valor en el input
    writeValue(value: any): void {
        this.value = value;
    }

    // Registra una funcion que se llamara cuando ocurra onChange
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    // Registra una funcion que se llamara cuando ocurra onTouched
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // ----- Variables y métodos propios
    // Inputs
    title = input<string>();
    items = input<string[]>();
    // Dropdown reference
    @ViewChild('drop') drop!: NgbDropdown;
    // Config
    readonly maxItems = 5;
    // Dsiplayed data
    filteredItems: string[] = [];

    /**
     * Metodo que filtra los items del dropdown basado en el valor del input.
     */
    filterDropdown() {
        if (this.items() === undefined || this.value === '' || this.items()!.length == 0) return [];

        const searchText = this.value.toLocaleLowerCase();
        const sourceArray = this.items() as string[];

        const filteredItems = sourceArray.filter(it => {
            return it.toLowerCase().includes(searchText);
        });

        if (filteredItems.length <= this.maxItems) {
            this.filteredItems = filteredItems;
        } else {
            const slicedArray = filteredItems.slice(0, this.maxItems);
            this.filteredItems = slicedArray;
        }

        return;
    }

    //
    clickOnItem(item: string) {
        this.drop.close();
        // Set value, set on change and generate call onTouched
        this.writeValue(item);
        this.onChange(item);
        this.onTouched();
    }

    dropdownHandler() {
        if (this.drop.isOpen()) {
            if (this.value === '') {
                this.drop.close();
            }
            if (this.filteredItems.length == 0) {
                this.drop.close();
            }
        } else {
            if (this.filteredItems.length > 0) {
                this.drop.open();
            }
        }
    }

    onInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const value: string = inputElement.value;
        if (value) {
            this.writeValue(value);
            this.onChange(this.value);
            this.onTouched();
            // Filter on change and handler dropdown
            this.filterDropdown();
            this.dropdownHandler();
        } else {
            // Si el valor esta vacio, actualizar el valor y cerrar el dropdown
            this.writeValue('');
            this.onChange(this.value);
            this.onTouched();
            // Close
            this.dropdownHandler();
        }
    }
}
