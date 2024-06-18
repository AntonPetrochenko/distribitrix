// Скостылено прямо из файла proto

interface SearchRequest {
    term: string;
    includeDisabled: boolean
}

interface ProductData {
    id: number;
    name: string;
    data: string;
    enabled: boolean;
}

interface ProductSet {
    products: ProductData[];
}
