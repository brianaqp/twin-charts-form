interface SPrototype {
    vesselName: string;
    cargo: string;
    importer: string;
    trader: string;
    loadingPort: string;
    country: string;
    dischargingPort: string;
}

interface StatisticsForm extends SPrototype {
    eta: CustomDate | string;
    tonnage: string | number;
}

interface Statistics extends SPrototype {
    _id?: string;
    eta: CustomDate;
    tonnage: number;
}

type StatisticsFilterForm = Omit<StatisticsForm, 'tonnage'>;

type CustomDate = {
    year: number;
    month: number;
    day: number;
};

type StatisticsKeys =
    | 'vesselName'
    | 'cargo'
    | 'importer'
    | 'trader'
    | 'loadingPort'
    | 'country'
    | 'dischargingPort'
    | 'eta'
    | 'tonnage';

export { StatisticsForm, Statistics, StatisticsKeys, StatisticsFilterForm, CustomDate };
