export type ApiResponse = {
    payload: {
        photobooks: PhotoBook[];
    };
}

export type PhotoBook = {
    id: number;
    printing: string;
    cover: string;
    coverLamination: string;
    binding: string;
    paper: string;
    format: string;
    [key: string]: any; // for other properties we're not explicitly comparing
}

export type Config = {
    URLS: {
        URL1: string;
        URL2: string;
    };
    CHUNK_SIZE: number;
    PROPS_TO_COMPARE: (keyof PhotoBook)[];
}

export const CONFIG: Config = {
    URLS: {
        URL1: 'https://www.myposter.de/web-api/photobook-data?withoutRestrictedGroups=true',
        URL2: 'https://www.myposter.de/web-api/photobook-data'
    },
    CHUNK_SIZE: 1000,
    PROPS_TO_COMPARE: [
        'printing',
        'cover',
        'coverLamination',
        'binding',
        'paper',
        'format'
    ]
} as const 