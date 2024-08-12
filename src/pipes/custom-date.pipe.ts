import { Pipe, PipeTransform } from '@angular/core';
import { CustomDate } from '../app/interfaces/model';

@Pipe({
    name: 'customDatePipe',
    standalone: true,
})
export class CustomDatePipe implements PipeTransform {
    transform(value: CustomDate): string {
        return `${value.day}/${value.month}/${value.year}`;
    }
}
