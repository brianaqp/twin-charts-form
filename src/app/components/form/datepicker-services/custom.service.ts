import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CustomDate } from '../../../interfaces/model';

// Clase que extiende los metodos de NgbDateParserFormatter para trabajar directamente con el usuario y el calendario
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
    readonly DELIMITER = '/';

    // Input to NgbDateStruct
    parse(value: string): NgbDateStruct | null {
        console.log('parse ->', value);
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10),
            };
        }
        return null;
    }

    // Calendar interaction to Input representation
    format(date: NgbDateStruct | null): string {
        return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
    }
}

// Clase que maneja como la fecha es representada en el script. i.e NgModel
// En esta clase se maneja el formato mm/dd/yyyy
@Injectable()
export class CustomDateAdapter extends NgbDateAdapter<CustomDate> {
    readonly DELIMITER = '/';

    fromModel(value: CustomDate | null): NgbDateStruct | null {
        if (value) {
            return value;
        }
        return null;
    }

    toModel(date: NgbDateStruct | null): CustomDate | null {
        return date ? date : null;
    }
}
