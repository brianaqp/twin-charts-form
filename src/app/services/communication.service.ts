import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Statistics } from '../interfaces/model';

@Injectable({
    providedIn: 'root',
})

/**
 * SharedService
 * Servicio que permite la comunicacion entre el componente form y el componente statistics
 */
export class CommunicationService {
    // Canal de comunicacion a traves de Subject
    private $subject = new Subject<Statistics>();

    /**
     * Metodo que emite data a traves de las subscripciones.
     * @param data Objeto de tipo estadisticas
     */
    emitData(data: Statistics) {
        this.$subject.next(data);
    }

    /**
     * Metodo que retorna el subject como un observable.
     * @returns
     */
    getObserver() {
        return this.$subject.asObservable();
    }
}
