import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../app/archive/interfaces/users';

@Pipe({
    name: 'filter',
    standalone: true,
})
export class FilterPipe implements PipeTransform {
    transform(value: User[], searchText: string): User[] {
        if (!value) {
            return [];
        }
        if (!searchText) {
            return value;
        }
        // Regex
        const regex = new RegExp(
            searchText
                .split(' ')
                .map((word: string) => word.trim())
                .join('.*'),
            'i',
        );

        return value.filter(token => {
            // Usar la expresión regular para buscar coincidencias en el username
            return regex.test(token.username);
        });
    }
}
