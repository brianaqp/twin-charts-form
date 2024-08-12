export type AlertEvent = { type: string; message: string };

export type OperationResultEvent = {
    type: 'inserted' | 'updated' | 'deleted';
    status: 1 | 0;
    properties: {
        year: string;
        objectId: string;
    } | null;
};
