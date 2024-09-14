import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UpdateResult } from 'mongodb';
import { ChartsConfiguration } from '../interfaces/config';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../app/interfaces/apiResponse';

@Injectable({
    providedIn: 'root',
})

/**
 * Service to handler chart configuration
 */
export class ConfigurationService {
    private api = environment.api + '/configuration';
    private http = inject(HttpClient);

    // --- Get methods ---
    getAvailableYears() {
        return this.http.get<ApiResponse<ChartsConfiguration, null>>(`${this.api}/availableYears`);
    }

    insertYear(body: { year: string }) {
        return this.http.put<ApiResponse<null, UpdateResult>>(`${this.api}/availableYears`, body);
    }

    deleteYear(year: string) {
        return this.http.delete<ApiResponse<null, UpdateResult>>(
            `${this.api}/availableYears/${year}`,
        );
    }
}
