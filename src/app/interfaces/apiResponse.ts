import { StatisticsKeys } from "./model";

export interface ApiResponse<T, M> {
    data: T;
    message: string;
    log: M;
}

export type StringObjectId = string;

export type UpdateCustomResult = {
    modified: 1 | 0;
    properties: {
        year: string;
        objectId: StringObjectId;
    } | null;
};

export type AutoCompleteData = {
    data: string[];
    field: StatisticsKeys;
}
