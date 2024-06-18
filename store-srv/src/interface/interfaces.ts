// Скостылено прямо из файла proto

interface Status { // Минимальное для ранней разработки
    ok: boolean;
    message: string;
}

interface ProductRequest {
    id: number;
    allowDisabled: boolean;
}

interface ListingRequest {
    pageNumber: number;
    perPage: number;
    includeDisabled: boolean;
}

interface ProductData {
    id: number;
    name: string;
    data: string;
    enabled: boolean;
}

interface ProductCreationData {
    name: string;
    data: string;
    enabled: boolean;
}

interface ProductSet {
    products: ProductData[];
}

interface ProductCreationSet {
    products: ProductCreationData[];
}