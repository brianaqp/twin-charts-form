import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environemnt.dev';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../interfaces/apiResponse';
import { User, UserCreated } from '../interfaces/users';
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';

Injectable({
    providedIn: 'root',
});

export class UsersService {
    private readonly api = environment.api + '/users';
    private readonly http = inject(HttpClient);

    // --- AUTH METHODS ---
    createOne(body: { username: string }) {
        return this.http.post<ApiResponse<UserCreated, InsertOneResult>>(`${this.api}`, body);
    }

    get() {
        return this.http.get<ApiResponse<User[], null>>(`${this.api}`);
    }

    revalidate(objectId: string) {
        return this.http.put<ApiResponse<null, UpdateResult>>(`${this.api}/${objectId}`, {});
    }

    revoke(objectId: string) {
        return this.http.delete<ApiResponse<null, DeleteResult>>(`${this.api}/${objectId}`, {});
    }
}
