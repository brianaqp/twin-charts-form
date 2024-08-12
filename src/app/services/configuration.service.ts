import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../interfaces/apiResponse';
import { UpdateResult } from 'mongodb';
import { ChartsConfiguration } from '../interfaces/config';

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
