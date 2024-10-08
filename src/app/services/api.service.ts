import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Statistics, StatisticsKeys } from '../interfaces/model';
import { DeleteResult, InsertOneResult } from 'mongodb';
import {
    ApiResponse,
    AutoCompleteData,
    StringObjectId,
    UpdateCustomResult,
} from '../interfaces/apiResponse';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private api = environment.api + '/statistics';
    private apiFiles = environment.api + '/files';
    private http = inject(HttpClient);

    // --- GET METHODS ---
    getYears() {
        return this.http.get<ApiResponse<string[], null>>(`${this.api}/years`);
    }

    getDataByYear(year: string) {
        return this.http.get<ApiResponse<Statistics[], null>>(`${this.api}/${year}`);
    }

    getDataByWeek() {
        return this.http.get<ApiResponse<Statistics[], null>>(`${this.api}/weekly`);
    }

    getDataByUpcoming() {
        return this.http.get<ApiResponse<Statistics[], null>>(`${this.api}/upcoming`);
    }

    getAutoCompleteData(property: StatisticsKeys) {
        return this.http.get<ApiResponse<AutoCompleteData, null>>(
            `${this.api}/distinct/${property}`,
        );
    }

    // --- POST METHODS ---
    insertOne(data: Statistics, year: string) {
        return this.http.post<ApiResponse<StringObjectId, InsertOneResult>>(
            `${this.api}/${year}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }

    // --- UPDATE METHODS ---
    updateOne(data: Statistics, year: string) {
        return this.http.put<ApiResponse<null, UpdateCustomResult>>(
            `${this.api}/${year}/${data._id}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }

    // --- DELETE METHODS ---
    deleteOne(_id: string, year: string) {
        return this.http.delete<ApiResponse<null, DeleteResult>>(`${this.api}/${year}/${_id}`);
    }

    // --- FILES METHODS ---
    getExcelByYear(year: string) {
        return this.http.get(`${this.apiFiles}/excel/statistics/year/${year}`, {
            responseType: 'blob',
        });
    }

    getExcelByPeriod(category: 'weekly' | 'upcoming') {
        return this.http.get(`${this.apiFiles}/excel/statistics/${category}`, {
            responseType: 'blob',
        });
    }
}
